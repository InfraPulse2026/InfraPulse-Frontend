import fs from 'node:fs/promises';
const worker = new URL('../dist/mockServiceWorker.js', import.meta.url);
await fs.rm(worker, { force: true });
const assets = new URL('../dist/assets/', import.meta.url);
for (const file of await fs.readdir(assets)) {
  if (!file.endsWith('.js')) continue;
  const content = await fs.readFile(new URL(file, assets), 'utf8');
  if (
    ['DEMO-FCX012345', 'demo-role=', '192.0.2.50', 'setupWorker('].some((marker) =>
      content.includes(marker),
    )
  )
    throw new Error(`Demo fixture leaked into production bundle: ${file}`);
}
console.log('Production dist: no fixture dataset or mock worker.');
