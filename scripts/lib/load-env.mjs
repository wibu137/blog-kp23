import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

function parseEnvValue(rawValue) {
  const trimmed = rawValue.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseEnvContent(content) {
  const entries = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1);

    if (!key) {
      continue;
    }

    entries[key] = parseEnvValue(value);
  }

  return entries;
}

export async function loadEnvironment(rootDir) {
  const candidates = ['.env.local', '.env'].map((fileName) =>
    path.join(rootDir, fileName)
  );

  for (const candidate of candidates) {
    try {
      await access(candidate);
      const content = await readFile(candidate, 'utf8');
      const parsed = parseEnvContent(content);

      for (const [key, value] of Object.entries(parsed)) {
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch {
      // Ignore missing env files so the script can still rely on shell env vars.
    }
  }
}
