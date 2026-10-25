#!/usr/bin/env node
// Reads the official XSD bundles under schemas/ and emits src/nfse/_rtc-schemas.generated.ts
// with the contents inlined as template literals. Run this whenever a new
// Nota Técnica lands and the XSDs are updated:
//
//   node scripts/generate-schemas.mjs
//
// The output file is committed — there's no build-time transform.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const OUTPUT = join(REPO_ROOT, 'src', 'nfse', '_rtc-schemas.generated.ts');

// One bundle per DPS layout. `v1.01` is the layout in production until 2026-11-30 (NT 004 v2.0);
// `nt009-r1` is NT 009 release 1 (Produção Restrita bundle 20261020, production on 2026-12-01).
const BUNDLES = [
  { exportName: 'RTC_V1_01_SCHEMAS', dir: join(REPO_ROOT, 'schemas', '1.01') },
  { exportName: 'RTC_NT009_R1_SCHEMAS', dir: join(REPO_ROOT, 'schemas', '1.01-prodrest-20261020') },
];

const renderBundle = ({ exportName, dir }) => {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.xsd'))
    .sort();
  const entries = files
    .map((f) => {
      const contents = readFileSync(join(dir, f), 'utf-8');
      // escape backticks and ${ for template literals
      const escaped = contents.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
      return `  {\n    fileName: ${JSON.stringify(f)},\n    contents: \`${escaped}\`,\n  },`;
    })
    .join('\n');
  return `export const ${exportName}: readonly RtcSchemaFile[] = [\n${entries}\n];\n`;
};

const output = `// AUTO-GENERATED from schemas/*/*.xsd by scripts/generate-schemas.mjs.
// Do not edit by hand. Regenerate when a new Nota Técnica updates the XSDs.

export interface RtcSchemaFile {
  readonly fileName: string;
  readonly contents: string;
}

${BUNDLES.map(renderBundle).join('\n')}`;

writeFileSync(OUTPUT, output, 'utf-8');
console.log(`wrote ${BUNDLES.length} schema bundles to ${OUTPUT}`);
