import fs from "fs";
import path from "path";

function updateIndexExports(dir: string) {
  const files = fs.readdirSync(dir);
  const indexFiles = files.filter((f) => /^index\.(js|ts)$/.test(f));

  if (indexFiles.length > 0) {
    const exportFiles = files
      .filter(
        (f) =>
          !/^index\.(js|ts)$/.test(f) &&
          (f.endsWith(".js") || f.endsWith(".ts")) &&
          !f.endsWith(".d.ts"),
      )
      .map((f) => `export * from "./${f.replace(/\.(js|ts)$/, "")}";`)
      .join("\n");

    indexFiles.forEach((indexFile) => {
      fs.writeFileSync(path.join(dir, indexFile), exportFiles + "\n");
      console.log(`Updated: ${path.join(dir, indexFile)}`);
    });
  }

  // Recurse into subdirectories
  files
    .map((f) => path.join(dir, f))
    .filter((f) => fs.statSync(f).isDirectory())
    .forEach(updateIndexExports);
}

// Start from project src directory
updateIndexExports(path.join(__dirname, "../src"));
