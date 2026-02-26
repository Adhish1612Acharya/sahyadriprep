import fs from "fs";
import path from "path";

// Get the directory from command-line argument, default to current directory
const targetDir = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : process.cwd();

const files = fs.readdirSync(targetDir);

const exportFiles = files
  .filter(
    (f) =>
      !/^index\.(js|ts)$/.test(f) &&
      (f.endsWith(".js") || f.endsWith(".ts")) &&
      !f.endsWith(".d.ts"),
  )
  .map((f) => `export * from "./${f.replace(/\.(js|ts)$/, "")}";`)
  .join("\n");

fs.writeFileSync(path.join(targetDir, "index.ts"), exportFiles + "\n");
console.log(`Updated: ${path.join(targetDir, "index.ts")}`);
