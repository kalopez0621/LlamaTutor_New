import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

export type ChatGPTAgent = "user" | "system";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

export interface TogetherAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  stream: boolean;
}

export async function TogetherAIStream(payload: TogetherAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Log the payload being sent
  console.log("Payload sent to Together API:", payload);

  // API request
  const res = await fetch("https://together.helicone.ai/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Log response status and headers
  console.log("Response Status:", res.status);
  console.log("Response Headers:", res.headers);

  // Handle non-200 status codes
  if (res.status !== 200) {
    const errorBody = await res.text();
    console.error("Error Response Body:", errorBody);
    throw new Error(
      `Together API returned non-200 status: ${res.status} - ${res.statusText}`
    );
  }

  const readableStream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;
          controller.enqueue(encoder.encode(data));
        }
      };

      const parser = createParser(onParse);

      // Process the stream data
      try {
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      } catch (e) {
        console.error("Error processing stream:", e);
        controller.error(e);
      }
    },
  });

  let counter = 0;
  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      const data = decoder.decode(chunk);

      if (data === "[DONE]") {
        controller.terminate();
        return;
      }

      try {
        const json = JSON.parse(data);

        // Debug the JSON response
        console.log("Parsed JSON Response:", json);

        const text = json.choices?.[0]?.delta?.content || "";
        if (!text) {
          console.warn("Missing 'content' field in delta:", json);
          return;
        }

        if (counter < 2 && (text.match(/\n/) || []).length) {
          // Skip prefix characters like "\n\n"
          return;
        }

        const payload = { text: text };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        counter++;
      } catch (e) {
        console.error("Error parsing JSON:", e, "Chunk Data:", data);
        controller.error(e);
      }
    },
  });

  return readableStream.pipeThrough(transformStream);
}
