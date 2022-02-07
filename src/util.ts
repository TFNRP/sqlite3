import decamelize from 'decamelize';
import * as path from 'node:path';
import * as process from 'node:process';

export type Config = {
  readonly: boolean;
  timeout: number;
  filename: string;
  filepath?: string | undefined;
  debug: boolean;
}

export const parseConfig = {
  readonly: (value): boolean => Boolean(value) || false,
  timeout: (value): number => parseInt(value) || 5_000,
  filename: (value): string => typeof value === 'string' ? value : 'sqlite3.db',
  filepath: (value): string | undefined => typeof value === 'string' ? value : null,
  debug: (value): boolean => Boolean(value) || false,
}

export function getConfig(): Config {
  const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'config.json') ?? '{}');
  for (const key in parseConfig) {
    const value =
      GetConvar(`sqlite3_${decamelize(key)}`, null) ||
      GetConvar(`sqlite3_${key}`, null) ||
      GetResourceMetadata(GetCurrentResourceName(), `sqlite3_${decamelize(key)}`, 0) ||
      GetResourceMetadata(GetCurrentResourceName(), `sqlite3_${key}`, 0);
    if (value) config[key] = parseConfig[key](value);
  }
  return config;
}

export function getPathFromImplicit(filepath?: string, filename?: string): string {
  if (filepath) {
    if (!path.isAbsolute(filepath)) filepath = path.join(process.cwd(), filepath);
    if (filename) return path.join(filepath, filename);
    return filepath;
  }
  return filename;
}