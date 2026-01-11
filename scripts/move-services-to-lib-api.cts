/**
 * Console script to safely copy service files from /services to /lib/api/[service]/[service].ts,
 * creating the required folder structure and not deleting or cutting any files.
 *
 * Usage: ts-node move-services-to-lib-api.ts
 */

import * as fs from "fs";
import * as path from "path";

// Root directories
const ROOT = path.resolve(__dirname, "..");
const SERVICES_DIR = path.join(ROOT, "src", "services");
const LIB_API_DIR = path.join(ROOT, "src", "lib", "api");

// Helper to capitalize the first letter
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Get all .service.ts files in /services
const serviceFiles = fs
  .readdirSync(SERVICES_DIR)
  .filter((file) => file.endsWith(".service.ts"));

for (const file of serviceFiles) {
  const serviceName = file.replace(".service.ts", ""); // e.g., "student"
  const srcPath = path.join(SERVICES_DIR, file);
  const destDir = path.join(LIB_API_DIR, serviceName);
  const destFile = path.join(destDir, `${serviceName}.ts`);

  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Created directory: ${destDir}`);
  }

  // Copy the service file to the new location
  fs.copyFileSync(srcPath, destFile);
  console.log(`Copied ${srcPath} -> ${destFile}`);

  // Create index.ts if it doesn't exist
  const indexPath = path.join(destDir, "index.ts");
  if (!fs.existsSync(indexPath)) {
    const exportLine = `export * from "./${serviceName}";\nexport * from "./types";\n`;
    fs.writeFileSync(indexPath, exportLine);
    console.log(`Created index.ts in ${destDir}`);
  }

  // Create types.ts if it doesn't exist
  const typesPath = path.join(destDir, "types.ts");
  if (!fs.existsSync(typesPath)) {
    fs.writeFileSync(
      typesPath,
      `// Types for ${capitalize(serviceName)} API\n`
    );
    console.log(`Created types.ts in ${destDir}`);
  }
}

console.log("✅ Service files copied safely. No files were deleted or moved.");
