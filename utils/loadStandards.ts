import fs from "fs";
import path from "path";

// Function to load benchmarks from JSON
export const loadBenchmarks = () => {
  const filePath = path.resolve("./public/standards/grade6_benchmarks.json");
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const parsedData = JSON.parse(data);
    return parsedData.benchmarks || [];
  } catch (error) {
    console.error("Error loading benchmarks:", error);
    return [];
  }
};
