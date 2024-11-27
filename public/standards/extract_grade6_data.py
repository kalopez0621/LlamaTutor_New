import pdfplumber
import json

# Use the absolute path to the PDF
pdf_path = r"C:\Users\kalop\NLP_Projects\llamatutor\public\standards\B1G-M-Grd6-TI.pdf"
output_path = r"C:\Users\kalop\NLP_Projects\llamatutor\public\standards\grade6_benchmarks.json"

benchmarks = []

with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            for line in text.split("\n"):
                # Assuming benchmarks follow a specific format, adjust this condition as necessary
                if "Benchmark" in line:
                    benchmarks.append(line.strip())

# Save the extracted benchmarks to a JSON file
with open(output_path, "w") as json_file:
    json.dump({"benchmarks": benchmarks}, json_file, indent=4)

print(f"Benchmarks extracted and saved to {output_path}")
