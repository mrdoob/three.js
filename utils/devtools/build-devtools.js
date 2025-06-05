import { mkdir, copyFile, rm, readFile, writeFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// 1. Clean and recreate devtools/panel/build
await rm('devtools/panel/build', { recursive: true, force: true });
await mkdir('devtools/panel/build', { recursive: true });

// 2. Copy all main build files to devtools/panel/build
const buildFiles = [
  'three.core.js',
  'three.module.js',
  'three.tsl.js',
  'three.webgpu.js',
  'three.webgpu.nodes.js',
];
for (const file of buildFiles) {
  await copyFile(`build/${file}`, `devtools/panel/build/${file}`);
}

// 3. Copy and patch GLTFExporter.js to devtools/panel/exporters
await mkdir('devtools/panel/exporters', { recursive: true });
let exporterSrc = await readFile('examples/jsm/exporters/GLTFExporter.js', 'utf8');
// Replace any export { GLTFExporter } with export default GLTFExporter;
exporterSrc = exporterSrc.replace(/export\s*\{\s*GLTFExporter\s*\};?/g, 'export default GLTFExporter;');
await writeFile('devtools/panel/exporters/GLTFExporter.js', exporterSrc);

// 4. Run Rollup to build the UMD bundle
console.log('Running Rollup for GLTFExporter UMD...');
await execAsync('npx rollup -c utils/devtools/rollup.gltfexporter.config.cjs');
console.log('Devtools build complete.');
