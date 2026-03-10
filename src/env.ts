// NOTE(kroot): simple .env loader without dependencies

import * as fs from "node:fs";
import * as path from "node:path";

// NOTE(kroot): load .env file from project root
export function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf-8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    // NOTE(kroot): skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // NOTE(kroot): remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // NOTE(kroot): don't override existing env vars
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

// NOTE(kroot): auto-load on import
loadEnv();
