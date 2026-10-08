import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'CSS/style.css'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Hay IDs duplicados.');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Debe existir un solo h1.');
assert.match(html, /<html lang="es">/, 'Falta el idioma del contenido.');
assert.match(html, /name="description"/, 'Falta la descripción SEO.');
assert.doesNotMatch(html, /Lorem Ipsum|href="#"/, 'Hay contenido de relleno o enlaces vacíos.');

for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  const value = match[1];
  if (value.startsWith('#')) {
    assert.ok(ids.includes(value.slice(1)), `Ancla inexistente: ${value}`);
  } else if (!/^[a-z]+:/.test(value)) {
    await access(path.join(root, value));
  }
}
for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
  for (const item of match[1].split(',')) await access(path.join(root, item.trim().split(/\s+/)[0]));
}
for (const match of html.matchAll(/\b(?:aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g)) {
  for (const id of match[1].split(' ')) assert.ok(ids.includes(id), `Referencia accesible inexistente: ${id}`);
}
for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  assert.match(match[0], /\balt="[^"]+"/, 'Una imagen carece de descripción.');
  assert.match(match[0], /\bwidth="\d+"/, 'Una imagen carece de ancho.');
  assert.match(match[0], /\bheight="\d+"/, 'Una imagen carece de alto.');
}
const productIds = new Set();
for (const match of html.matchAll(/<article\b[^>]*data-product="([^"]+)"[^>]*>/g)) {
  assert.ok(!productIds.has(match[1]), `Producto duplicado: ${match[1]}`);
  productIds.add(match[1]);
  assert.match(match[0], /data-price="[1-9]\d*"/, 'Precio inválido.');
  const image = match[0].match(/data-image="([a-z0-9-]+)"/);
  assert.ok(image, 'Falta la imagen del producto.');
  await access(path.join(root, `assets/images/${image[1]}-400.webp`));
}
assert.ok(productIds.size > 0, 'No hay productos.');
for (const match of html.matchAll(/data-add="([^"]+)"/g)) assert.ok(productIds.has(match[1]), 'Botón de producto sin producto.');
assert.match(css, /prefers-reduced-motion/, 'Falta soporte para movimiento reducido.');
console.log(`Verificación correcta: ${productIds.size} productos, enlaces, imágenes, IDs y referencias accesibles.`);
