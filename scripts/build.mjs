import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'CSS/images'), { recursive: true });
for (const file of ['index.html', 'CSS/style.css', 'CSS/images/coffe.svg', 'js', 'assets', '_headers']) {
  await cp(path.join(root, file), path.join(dist, file), { recursive: true });
}
const { size } = await stat(path.join(dist, 'index.html'));
console.log(`Sitio generado en dist/ (${(size / 1024).toFixed(1)} KB de HTML). Solo se incluyen los recursos usados por la página.`);
