import pdfplumber
import json
import os

# Specify the path to your PDF file
pdf_path = "C:/Users/kalop/NLP_Projects/llamatutor/public/standards/Grade 6 Mathematics ALD Tables.pdf"
output_json_path = "C:/Users/kalop/NLP_Projects/llamatutor/public/standards/grade6_benchmarks.json"

# Function to extract benchmarks
def extract_benchmarks(pdf_path, output_json_path):
    benchmarks = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue
            
            # Identify benchmarks by their common pattern (e.g., MA.6.*)
            lines = text.split("\n")
            for line in lines:
                if line.startswith("MA.6."):
                    benchmarks.append(line.strip())

    # Write the benchmarks to a JSON file
    with open(output_json_path, "w") as json_file:
        json.dump({"benchmarks": benchmarks}, json_file, indent=4)

    print(f"Benchmarks extracted and saved to {output_json_path}")

# Run the extraction function
extract_benchmarks(pdf_path, output_json_path)
