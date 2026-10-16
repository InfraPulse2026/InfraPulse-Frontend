import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import openapiTS, { astToString } from 'openapi-typescript';
const input = new URL('../api/openapi.json', import.meta.url);
const target = new URL('../src/api/generated/schema.d.ts', import.meta.url);
const bytes = await fs.readFile(input);
const hash = crypto.createHash('sha256').update(bytes).digest('hex');
const schema = JSON.parse(bytes);
const output = astToString(await openapiTS(input));
if (process.argv.includes('--check')) {
  if ((await fs.readFile(target, 'utf8')) !== output)
    throw new Error('API types are stale; run pnpm api:generate');
  const lock = JSON.parse(
    await fs.readFile(new URL('../api/contract.json', import.meta.url), 'utf8'),
  );
  if (lock.sha256 !== hash) throw new Error('API snapshot hash mismatch');
  console.log(`Contract ${schema.info.version} / ${hash}: OK`);
} else {
  await fs.mkdir(new URL('../src/api/generated', import.meta.url), { recursive: true });
  await fs.writeFile(target, output);
  await fs.writeFile(
    new URL('../api/contract.json', import.meta.url),
    JSON.stringify(
      {
        version: schema.info.version,
        sha256: hash,
        backendCommit: '58d1e088f0fa0f744209b909e473a269779c1ea6',
        frozenAt: '2026-10-15',
      },
      null,
      2,
    ) + '\n',
  );
}
