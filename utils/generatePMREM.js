// Usage: node utils/generatePMREM.js input.hdr output.ktx2 [basisu-path]
// Requires Basis Universal 2.50 or later, with HDR compression support.

import puppeteer from 'puppeteer';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { createServer } from './server.js';

const [ input, output, encoder ] = process.argv.slice( 2 );

if ( ! input || ! output || process.argv.length > 5 ) {

	console.error( 'Usage: node utils/generatePMREM.js input.hdr output.ktx2 [basisu-path]' );
	process.exit( 1 );

}

const source = await readFile( resolve( input ) );
const outputPath = resolve( output );
const basisu = encoder ? resolve( encoder ) : 'basisu';
const directory = await mkdtemp( join( tmpdir(), 'three-pmrem-' ) );
const faces = [ 'px', 'nx', 'py', 'ny', 'pz', 'nz' ].map( face => join( directory, `${face}.dds` ) );
const server = createServer( { root: fileURLToPath( new URL( '..', import.meta.url ) ) } );
let browser;

try {

	server.listen( 0, '127.0.0.1' );
	await once( server, 'listening' );

	browser = await puppeteer.launch( { headless: true, args: [ '--no-sandbox' ], protocolTimeout: 120000 } );
	const page = await browser.newPage();
	const errors = [];
	page.on( 'pageerror', error => errors.push( error.message ) );
	page.on( 'console', message => {

		if ( message.type() === 'error' ) errors.push( message.text() );

	} );

	await page.setRequestInterception( true );
	page.on( 'request', request => {

		const pathname = new URL( request.url() ).pathname;

		if ( pathname === '/generate-pmrem.html' ) {

			return request.respond( {
				status: 200,
				contentType: 'text/html',
				body: '<link rel="icon" href="data:,"><script type="importmap">{"imports":{"three":"/src/Three.js"}}</script>'
			} );

		}

		if ( pathname === '/input.hdr' ) {

			return request.respond( { status: 200, contentType: 'application/octet-stream', body: source } );

		}

		return request.continue();

	} );

	await page.exposeFunction( 'writeFace', async ( face, size, levels, data ) => {

		// DDS with a DX10 header: RGBA32F, 2D, one layer, custom mip levels.
		const header = Buffer.alloc( 148 );
		header.write( 'DDS ' );
		header.write( 'DX10', 84 );

		for ( const [ offset, value ] of [
			[ 4, 124 ], [ 8, 0x2100f ], [ 12, size ], [ 16, size ], [ 20, size * 16 ],
			[ 28, levels ], [ 76, 32 ], [ 80, 4 ], [ 108, 0x401008 ],
			[ 128, 2 ], [ 132, 3 ], [ 140, 1 ]
		] ) {

			header.writeUInt32LE( value, offset );

		}

		await writeFile( faces[ face ], Buffer.concat( [ header, Buffer.from( data, 'base64' ) ] ) );

	} );

	await page.goto( `http://127.0.0.1:${server.address().port}/generate-pmrem.html` );

	const result = await page.evaluate( async () => {

		const THREE = await import( '/src/Three.js' );
		const { HDRLoader } = await import( '/examples/jsm/loaders/HDRLoader.js' );
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize( 16, 16 );

		const texture = await new HDRLoader().setDataType( THREE.FloatType ).loadAsync( '/input.hdr' );
		const generator = new THREE.PMREMGenerator( renderer );
		const target = generator.fromEquirectangular( texture );
		const size = target.width;
		const levels = target.texture.mipmaps.length;
		const gl = renderer.getContext();
		let clamped = 0;

		for ( let face = 0; face < 6; face ++ ) {

			// Convert render-target orientation to imported cubemap orientation.
			// Swap X faces and flip horizontally; preserve readback row order.
			const sourceFace = face < 2 ? 1 - face : face;
			const mipmaps = [];

			for ( let level = 0; level < levels; level ++ ) {

				const width = size >> level;
				const pixels = new Float32Array( width * width * 4 );
				renderer.setRenderTarget( target, sourceFace, level );
				gl.readPixels( 0, 0, width, width, gl.RGBA, gl.FLOAT, pixels );

				if ( gl.getError() !== gl.NO_ERROR ) throw new Error( 'PMREM readback failed.' );

				const flipped = new Float32Array( pixels.length );

				for ( let y = 0; y < width; y ++ ) {

					for ( let x = 0; x < width; x ++ ) {

						for ( let channel = 0; channel < 4; channel ++ ) {

							let value = pixels[ ( y * width + width - 1 - x ) * 4 + channel ];

							if ( ! Number.isFinite( value ) ) throw new Error( 'PMREM contains non-finite radiance.' );

							// ASTC HDR's maximum. Higher values make Basis rescale the entire image.
							if ( channel < 3 && value > 65280 ) {

								value = 65280;
								clamped ++;

							}

							flipped[ ( y * width + x ) * 4 + channel ] = value;

						}

					}

				}

				mipmaps.push( new Uint8Array( flipped.buffer ) );

			}

			const bytes = new Uint8Array( mipmaps.reduce( ( sum, mip ) => sum + mip.length, 0 ) );
			let offset = 0;

			for ( const mip of mipmaps ) {

				bytes.set( mip, offset );
				offset += mip.length;

			}

			await window.writeFace( face, size, levels, bytes.toBase64() );

		}

		renderer.setRenderTarget( null );
		target.dispose();
		generator.dispose();
		texture.dispose();
		renderer.dispose();

		return { size, levels, clamped };

	} );

	if ( errors.length > 0 ) throw new Error( errors.join( '\n' ) );

	console.log( `Generated six ${result.size}px faces with ${result.levels} mip levels; clamped ${result.clamped} RGB values to 65280.` );
	console.log( 'Encoding HDR cubemap…' );
	await mkdir( dirname( outputPath ), { recursive: true } );

	// Keep PMREM's convolved mip levels; do not add Basis's -mipmap option.
	await promisify( execFile )( basisu, [
		'-hdr_4x4', '-linear', '-tex_type', 'cubemap', '-tex_array',
		'-ktx2_zstandard_level', '19',
		'-uastc_level', '3', '-max_threads', '6', '-output_file', outputPath,
		...faces
	], { cwd: directory, maxBuffer: 16 * 1024 * 1024 } );

	console.log( `Wrote ${outputPath}` );

} finally {

	await Promise.all( [
		browser?.close(),
		new Promise( resolve => server.close( resolve ) ),
		rm( directory, { recursive: true, force: true } )
	] );

}
