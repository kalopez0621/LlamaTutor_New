import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";

let excludedSites = ["youtube.com"];
let searchEngine: "bing" | "serper" = "serper";

export async function POST(request: Request) {
  let { question } = await request.json();

  const finalQuestion = `what is ${question}`;

  // Step 1: Check if the topic exists in the local JSON file for benchmarks
  try {
    const benchmarksPath = path.resolve("./public/standards/grade6_benchmarks.json");
    const benchmarksData = JSON.parse(fs.readFileSync(benchmarksPath, "utf8"));

    const matchingBenchmarks = benchmarksData.benchmarks.filter((benchmark: string) =>
      benchmark.toLowerCase().includes(question.toLowerCase())
    );

    if (matchingBenchmarks.length > 0) {
      return NextResponse.json({
        sources: matchingBenchmarks,
        fromLocal: true,
      });
    }
  } catch (err) {
    console.error("Error reading local benchmarks file:", err);
  }

  // Step 2: If no local data, fall back to external sources
  if (searchEngine === "bing") {
    const BING_API_KEY = process.env["BING_API_KEY"];
    if (!BING_API_KEY) {
      throw new Error("BING_API_KEY is required");
    }

    const params = new URLSearchParams({
      q: `${finalQuestion} ${excludedSites.map((site) => `-site:${site}`).join(" ")}`,
      mkt: "en-US",
      count: "6",
      safeSearch: "Strict",
    });

    const response = await fetch(
      `https://api.bing.microsoft.com/v7.0/search?${params}`,
      {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": BING_API_KEY,
        },
      }
    );

    const BingJSONSchema = z.object({
      webPages: z.object({
        value: z.array(z.object({ name: z.string(), url: z.string() })),
      }),
    });

    const rawJSON = await response.json();
    const data = BingJSONSchema.parse(rawJSON);

    let results = data.webPages.value.map((result) => ({
      name: result.name,
      url: result.url,
    }));

    return NextResponse.json(results);
  } else if (searchEngine === "serper") {
    const SERPER_API_KEY = process.env["SERPER_API_KEY"];
    if (!SERPER_API_KEY) {
      throw new Error("SERPER_API_KEY is required");
    }

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: finalQuestion,
        num: 9,
      }),
    });

    const rawJSON = await response.json();

    const SerperJSONSchema = z.object({
      organic: z.array(z.object({ title: z.string(), link: z.string() })),
    });

    const data = SerperJSONSchema.parse(rawJSON);

    let results = data.organic.map((result) => ({
      name: result.title,
      url: result.link,
    }));

    return NextResponse.json(results);
  }
}
