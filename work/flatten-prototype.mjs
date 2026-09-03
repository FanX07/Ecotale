import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const distDir = new URL('../dist/', import.meta.url);
const prototypeFile = new URL('prototype.html', distDir);
let bundled = fs.readFileSync(prototypeFile, 'utf8');

const manifestMatch = bundled.match(/<script type="__bundler\/manifest">\s*([\s\S]*?)\s*<\/script>/);
const templateMatch = bundled.match(/<script type="__bundler\/template">\s*([\s\S]*?)\s*<\/script>/);
const resourcesMatch = bundled.match(/<script type="__bundler\/ext_resources">\s*([\s\S]*?)\s*<\/script>/);
if (!manifestMatch || !templateMatch) throw new Error('Prototype bundle data was not found in dist.');

const manifest = JSON.parse(manifestMatch[1]);
let template = JSON.parse(templateMatch[1]);
const externalResources = resourcesMatch ? JSON.parse(resourcesMatch[1]) : [];
const assetsDir = new URL('prototype-assets/', distDir);
fs.mkdirSync(assetsDir, { recursive: true });

const extensions = new Map([
  ['application/javascript', '.js'],
  ['text/javascript', '.js'],
  ['application/json', '.json'],
  ['font/woff2', '.woff2'],
  ['text/css', '.css']
]);
const resourceUrls = {};

for (const [uuid, entry] of Object.entries(manifest)) {
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) bytes = zlib.gunzipSync(bytes);
  if (entry.mime.includes('javascript') || entry.mime === 'text/css') {
    const source = bytes.toString('utf8')
      .replaceAll("'/figma-", "'./figma-")
      .replaceAll('"/figma-', '"./figma-')
      .replaceAll('`/figma-', '`./figma-');
    bytes = Buffer.from(source);
  }
  const extension = extensions.get(entry.mime) || '.bin';
  const filename = `${uuid}${extension}`;
  fs.writeFileSync(new URL(filename, assetsDir), bytes);
  const publicUrl = `./prototype-assets/${filename}`;
  template = template.split(uuid).join(publicUrl);
  resourceUrls[uuid] = publicUrl;
}

const namedResources = {};
for (const resource of externalResources) {
  if (resource.id === 'imageSlotsState') {
    namedResources[resource.id] = './image-slots.state.json?v=20260903-final';
  } else if (resourceUrls[resource.uuid]) {
    namedResources[resource.id] = resourceUrls[resource.uuid];
  }
}

template = template
  .replace(/\s+integrity="[^"]*"/gi, '')
  .replace(/\s+crossorigin="[^"]*"/gi, '');

const resourcesScript = `<script>window.__resources = ${JSON.stringify(namedResources).replace(/<\//g, '<\\/')};<\/script>`;
template = template.replace(/<head([^>]*)>/i, `<head$1>${resourcesScript}`);
fs.writeFileSync(prototypeFile, template);

console.log(`Flattened prototype into normal static files (${Object.keys(manifest).length} assets).`);
