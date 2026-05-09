import { rm, mkdir, writeFile } from 'node:fs/promises';

await rm( './build', { recursive: true, force: true } );

await mkdir( './build' );

const contents = {
    'three.core.js': `export * from '../src/Three.Core.js';`,
    'three.module.js': `export * from '../src/Three.js';`,
    'three.tsl.js': `export * from '../src/Three.TSL.js';`,
    'three.webgpu.js': `export * from '../src/Three.WebGPU.js';`,
    'three.webgpu.nodes.js': `export * from '../src/Three.WebGPU.Nodes.js';`,
}

await Promise.all( Object.entries( contents ).map( ( [ filename, content ] ) => 
    writeFile( `./build/${ filename }`, '// dev build\n' + content + '\n' )
) );
