import { cp, mkdir, readdir, rm, stat, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const nativeRoot = path.resolve(here, '..');
const repoRoot = path.resolve(nativeRoot, '..');
const target = process.argv[2];

if (!['customer', 'technician'].includes(target)) {
  throw new Error('Usage: node native/scripts/stage-web.mjs customer|technician');
}

const out = path.join(nativeRoot, target, 'www');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const ignoredTop = new Set(['.git', '.github', 'native', 'tests', 'scripts']);
const allowedExt = new Set(['.html','.js','.css','.json','.webmanifest','.png','.jpg','.jpeg','.webp','.svg','.ico']);

async function copyTree(src, dst, topLevel = false) {
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (topLevel && ignoredTop.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      await mkdir(to, { recursive: true });
      await copyTree(from, to, false);
    } else if (allowedExt.has(path.extname(entry.name).toLowerCase()) || entry.name === '.nojekyll') {
      await copyFile(from, to);
    }
  }
}

await copyTree(repoRoot, out, true);

if (target === 'technician') {
  await copyFile(path.join(repoRoot, 'tech.html'), path.join(out, 'index.html'));
}

console.log(`Staged ${target} web assets in ${out}`);
