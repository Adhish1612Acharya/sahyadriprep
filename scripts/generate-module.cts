import fs from "fs";
import path from "path";

// Template for each file type
const templates: Record<string, string> = {
  fetch: `// fetch.ts\n`,
  create: `// create.ts\n`,
  update: `// update.ts\n`,
  delete: `// delete.ts\n`,
};

// Helper to create files and update index.ts
function createModuleFiles(
  baseDir: string,
  moduleName: string,
  files: string[],
) {
  const moduleDir = path.join(baseDir, moduleName);
  if (!fs.existsSync(moduleDir)) fs.mkdirSync(moduleDir, { recursive: true });

  files.forEach((file) => {
    const filePath = path.join(moduleDir, `${file}.ts`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, templates[file] || `// ${file}.ts\n`);
    }
  });

  // Always generate index.ts with exports
  const exportLines = files.map((f) => `export * from "./${f}";`).join("\n");
  fs.writeFileSync(path.join(moduleDir, "index.ts"), exportLines + "\n");
  console.log(`Created: ${moduleDir}`);
}

// Parse arguments
const [target, moduleName, ...rest] = process.argv.slice(2);
if (!target || !moduleName) {
  console.log(
    "Usage: ts-node scripts/generate-module.cts <repository|services> <moduleName> [putAll|file1 file2 ...]",
  );
  process.exit(1);
}

const baseDir =
  target === "repository"
    ? path.join(__dirname, "../src/lib/repositories")
    : target === "services"
      ? path.join(__dirname, "../src/lib/services")
      : null;

if (!baseDir) {
  console.log("Target must be 'repository' or 'services'");
  process.exit(1);
}

let files: string[] = [];
if (rest[0] === "putAll") {
  files = ["fetch", "create", "update", "delete"];
} else if (rest.length > 0) {
  files = rest;
} else {
  files = ["index"];
}

createModuleFiles(baseDir, moduleName, files);
