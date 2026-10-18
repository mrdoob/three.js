// Bakes the global illumination of a glTF file into light maps with LightBaker, in a WebGPU browser
// driven through puppeteer.
//
//   node utils/lightbake/bake.mjs input.glb -o output.glb --algorithm stochastic --format khr \
//     --resolution 1024 --page-size 2048 --tolerance 0.03 --directional --browser-url http://127.0.0.1:9222
//
// Run `node utils/lightbake/bake.mjs --help` for all options.
//
// It serves the repository and the input files on a local port, opens utils/lightbake/bake.html in a
// browser with WebGPU and writes the baked file. Connect to a running browser with --browser-url, e.g.
// one started with `chromium --remote-debugging-port=9222 --enable-unsafe-webgpu`, or launch one with
// --executable. Headless browsers often lack hardware WebGPU, so --browser-url to a browser with a
// window is the most reliable.

/* global process, console, performance, URL, Buffer, window */

import http from 'http';
import path from 'path';
import { createReadStream, existsSync, statSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const repository = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '../..' );

const usage = `Usage: node utils/lightbake/bake.mjs <input.glb|input.gltf> [options]

  -o, --output <file>       The baked .glb, <input>_baked.glb by default
  --algorithm <name>        stochastic, ray, probes or vxgi (stochastic)
  --format <name>           khr, khr8, unlit, unlit-vertex or emissive (khr)
  --resolution <texels>     The light map atlas resolution, it grows until the charts fit (1024)
  --page-size <texels>      The maximum light map page size (2048)
  --tolerance <noise>       The relative noise at which the bake stops, e.g. 0.03 (per algorithm)
  --max-samples <count>     The maximum samples (per algorithm)
  --directional             Bake directional light maps, which keep normal maps visible
  --direct-light <mode>     live or baked: whether the direct light of the lights is baked too (live)
  --no-denoise              Do not denoise the light maps
  --keep-uv1                Bake into the uv1 of the file instead of unwrapping new light map UVs
  --sky <file.hdr|none>     An equirectangular .hdr, .exr, .jpg or .png sky. Files without lights get a default sky
  --sky-intensity <value>   The intensity of the sky (1)
  --sun <elev,azim,int>     A sun at the elevation and azimuth in degrees with the intensity, or none.
                            Files without lights and without --sky get a sun at 50,30,3
  --tone-mapping <name>     The tone mapping of the unlit formats: none, linear, reinhard, aces, agx, neutral (aces)
  --exposure <value>        The exposure of the unlit formats (1)
  --browser-url <url>       Connect to a running browser, e.g. http://127.0.0.1:9222
  --executable <path>       Launch this browser, e.g. /usr/bin/chromium
  --headless                Launch it without a window, which often lacks hardware WebGPU
  --verify                  Load the result with GLTFLoader and the KHR_lightmap extension afterwards
  --timeout <seconds>       Give up after this time (600)
  -h, --help                Show this help
`;

const formats = {
	'khr': { format: 'KHR_lightmap', bitDepth: 16 },
	'khr8': { format: 'KHR_lightmap', bitDepth: 8 },
	'unlit': { format: 'unlit', bitDepth: 16 },
	'unlit-vertex': { format: 'unlit-vertex', bitDepth: 16 },
	'emissive': { format: 'emissive', bitDepth: 16 }
};

const mimeTypes = {
	'.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.wasm': 'application/wasm',
	'.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ktx2': 'image/ktx2',
	'.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream', '.hdr': 'application/octet-stream', '.exr': 'application/octet-stream'
};

function parseArguments( args ) {

	const options = {
		input: null, output: null, algorithm: 'stochastic', format: 'khr', resolution: 1024, pageSize: 2048, tolerance: null, maxSamples: null,
		directional: false, directLight: 'live', denoise: true, keepUV1: false, sky: null, skyIntensity: 1, sun: null, toneMapping: 'aces', exposure: 1,
		browserURL: null, executable: null, headless: false, verify: false, timeout: 600
	};

	const number = ( value, name ) => {

		const result = Number( value );
		if ( Number.isFinite( result ) === false ) throw new Error( `${ name } needs a number, not "${ value }".` );
		return result;

	};

	for ( let i = 0; i < args.length; i ++ ) {

		const arg = args[ i ];
		const value = () => {

			if ( i + 1 >= args.length ) throw new Error( `${ arg } needs a value.` );
			return args[ ++ i ];

		};

		switch ( arg ) {

			case '-h': case '--help': options.help = true; break;
			case '-o': case '--output': options.output = value(); break;
			case '--algorithm': options.algorithm = value(); break;
			case '--format': options.format = value(); break;
			case '--resolution': options.resolution = number( value(), arg ); break;
			case '--page-size': options.pageSize = number( value(), arg ); break;
			case '--tolerance': options.tolerance = number( value(), arg ); break;
			case '--max-samples': options.maxSamples = number( value(), arg ); break;
			case '--directional': options.directional = true; break;
			case '--direct-light': options.directLight = value(); break;
			case '--no-denoise': options.denoise = false; break;
			case '--keep-uv1': options.keepUV1 = true; break;
			case '--sky': options.sky = value(); break;
			case '--sky-intensity': options.skyIntensity = number( value(), arg ); break;
			case '--sun': options.sun = value(); break;
			case '--tone-mapping': options.toneMapping = value(); break;
			case '--exposure': options.exposure = number( value(), arg ); break;
			case '--browser-url': options.browserURL = value(); break;
			case '--executable': options.executable = value(); break;
			case '--headless': options.headless = true; break;
			case '--verify': options.verify = true; break;
			case '--timeout': options.timeout = number( value(), arg ); break;

			default:

				if ( arg.startsWith( '-' ) ) throw new Error( `Unknown option ${ arg }.` );
				if ( options.input !== null ) throw new Error( `Only one input file, got ${ options.input } and ${ arg }.` );
				options.input = arg;

		}

	}

	if ( options.help ) return options;

	if ( options.input === null ) throw new Error( 'No input file.' );
	if ( /\.(glb|gltf)$/i.test( options.input ) === false ) throw new Error( 'The input must be a .glb or .gltf file.' );
	if ( existsSync( options.input ) === false ) throw new Error( `${ options.input } does not exist.` );
	if ( formats[ options.format ] === undefined ) throw new Error( `Unknown format ${ options.format }, use one of ${ Object.keys( formats ).join( ', ' ) }.` );
	if ( [ 'none', 'linear', 'reinhard', 'aces', 'agx', 'neutral' ].includes( options.toneMapping ) === false ) throw new Error( `Unknown tone mapping ${ options.toneMapping }.` );
	if ( options.browserURL === null && options.executable === null ) throw new Error( 'Pass --browser-url of a running browser with WebGPU, or the --executable of one to launch.' );

	if ( options.sky !== null && options.sky !== 'none' && existsSync( options.sky ) === false ) throw new Error( `${ options.sky } does not exist.` );

	if ( options.sun !== null && options.sun !== 'none' ) {

		const values = options.sun.split( ',' ).map( ( value ) => number( value, '--sun' ) );
		if ( values.length !== 3 ) throw new Error( '--sun needs the elevation, azimuth and intensity, e.g. 50,30,3.' );
		options.sun = { elevation: values[ 0 ], azimuth: values[ 1 ], intensity: values[ 2 ] };

	}

	options.output ??= options.input.replace( /\.(glb|gltf)$/i, '_baked.glb' );

	return options;

}

// serves the repository, the directory of the input and its parent under /__input/, so that a .gltf can
// refer to files in a sibling directory, the sky under /__sky/, and receives the result at /__output

function createServer( options, onOutput ) {

	const inputDirectory = path.dirname( path.dirname( path.resolve( options.input ) ) );

	const resolve = ( root, relative ) => {

		const file = path.resolve( root, '.' + path.posix.normalize( '/' + relative ) );
		return file.startsWith( root ) ? file : null;

	};

	return http.createServer( ( request, response ) => {

		const url = decodeURIComponent( new URL( request.url, 'http://localhost' ).pathname );

		if ( url === '/__output' && request.method === 'POST' ) {

			const chunks = [];
			request.on( 'data', ( chunk ) => chunks.push( chunk ) );
			request.on( 'end', () => {

				onOutput( Buffer.concat( chunks ) );
				response.writeHead( 200 );
				response.end();

			} );

			return;

		}

		if ( url === '/favicon.ico' ) {

			response.writeHead( 204 );
			response.end();
			return;

		}

		let file = null;

		if ( url.startsWith( '/__input/' ) ) file = resolve( inputDirectory, url.slice( '/__input/'.length ) );
		else if ( url.startsWith( '/__sky/' ) ) file = path.resolve( options.sky );
		else if ( url === '/__output' ) file = path.resolve( options.output );
		else file = resolve( repository, url );

		if ( file === null || existsSync( file ) === false || statSync( file ).isFile() === false ) {

			console.log( `  [server] ${ url } not found` );

			response.writeHead( 404 );
			response.end();
			return;

		}

		response.writeHead( 200, { 'Content-Type': mimeTypes[ path.extname( file ).toLowerCase() ] ?? 'application/octet-stream', 'Cache-Control': 'no-store' } );
		createReadStream( file ).pipe( response );

	} );

}

function formatProgress( progress ) {

	if ( progress.stage === 'loaded' ) return `Loaded ${ progress.triangles } triangles, ${ progress.lights } lights` + ( progress.skinned > 0 ? `, ${ progress.skinned } skinned meshes left out` : '' );
	if ( progress.stage === 'preparing' ) return 'Unwrapping and preparing the GI source…';
	if ( progress.stage === 'baking' ) return `Baking: ${ progress.samples } samples, ${ progress.noise === null || progress.noise > 1e9 ? 'estimating noise' : ( progress.noise * 100 ).toFixed( 1 ) + '% noise' }, ${ progress.time.toFixed( 1 ) } s`;
	if ( progress.stage === 'vertices' ) return `Fitting vertex colors: ${ progress.vertices } vertices, ${ ( progress.error * 100 ).toFixed( 1 ) }% error`;
	if ( progress.stage === 'writing' ) return 'Writing glTF…';

	return JSON.stringify( progress );

}

async function main() {

	const options = parseArguments( process.argv.slice( 2 ) );

	if ( options.help ) {

		console.log( usage );
		return;

	}

	let output = null;

	const server = createServer( options, ( data ) => output = data );
	await new Promise( ( resolve ) => server.listen( 0, '127.0.0.1', resolve ) );
	const origin = `http://127.0.0.1:${ server.address().port }`;

	const launched = options.browserURL === null;
	const browser = launched ? await puppeteer.launch( {
		executablePath: options.executable,
		headless: options.headless,
		args: [ '--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-angle=vulkan', '--ignore-gpu-blocklist' ]
	} ) : await puppeteer.connect( { browserURL: options.browserURL, defaultViewport: null } );

	let page = null;
	const start = performance.now();

	try {

		page = await browser.newPage();
		page.setDefaultTimeout( options.timeout * 1000 );

		let lastStage = '', lastTime = 0;

		page.on( 'console', ( message ) => {

			if ( message.type() === 'error' || message.type() === 'warn' ) console.log( `  [page ${ message.type() }] ${ message.text() }` );

		} );
		page.on( 'pageerror', ( error ) => console.log( `  [page error] ${ error.message }` ) );

		await page.exposeFunction( 'lightBakeProgress', ( progress ) => {

			// one line per stage, and the progress of a stage every few seconds

			if ( progress.stage !== lastStage || performance.now() - lastTime > 2000 ) {

				console.log( formatProgress( progress ) );
				lastStage = progress.stage;
				lastTime = performance.now();

			}

		} );

		await page.goto( `${ origin }/utils/lightbake/bake.html`, { waitUntil: 'load' } );
		await page.waitForFunction( () => window.lightBakeReady === true );

		const { format, bitDepth } = formats[ options.format ];

		const result = await page.evaluate( ( settings ) => window.lightBake( settings ), {
			input: `/__input/${ [ path.basename( path.dirname( path.resolve( options.input ) ) ), path.basename( options.input ) ].map( encodeURIComponent ).join( '/' ) }`,
			output: '/__output',
			algorithm: options.algorithm,
			format, bitDepth,
			resolution: options.resolution,
			pageSize: options.pageSize,
			tolerance: options.tolerance,
			maxSamples: options.maxSamples,
			directional: options.directional,
			directLight: options.directLight,
			denoise: options.denoise,
			keepUV1: options.keepUV1,
			sky: options.sky === 'none' ? false : options.sky !== null ? `/__sky/${ encodeURIComponent( path.basename( options.sky ) ) }` : null,
			defaultSky: '/examples/textures/equirectangular/venice_sunset_1k.hdr',
			skyIntensity: options.skyIntensity,
			sun: options.sun === 'none' ? false : options.sun,
			defaultSun: { elevation: 50, azimuth: 30, intensity: 3 },
			toneMapping: options.toneMapping,
			exposure: options.exposure
		} );

		if ( output === null ) throw new Error( 'The page did not send the result.' );

		writeFileSync( options.output, output );

		console.log( `Baked ${ result.samples } samples, ${ ( ( result.noise ?? Infinity ) * 100 ).toFixed( 1 ) }% noise in ${ result.time.toFixed( 1 ) } s: ${ result.pages } page${ result.pages > 1 ? 's' : '' } of ${ result.size }² at ${ result.resolution }, ${ result.meshes - result.excluded } of ${ result.meshes } meshes light-mapped` );
		console.log( `Wrote ${ options.output } (${ ( output.length / 1024 / 1024 ).toFixed( 2 ) } MB) in ${ ( ( performance.now() - start ) / 1000 ).toFixed( 1 ) } s` );

		if ( options.verify ) {

			const verified = await page.evaluate( () => window.lightBakeVerify( '/__output' ) );
			console.log( `Verified with GLTFLoader: ${ JSON.stringify( verified ) }` );

		}

	} finally {

		await page?.close().catch( () => {} );

		if ( launched ) await browser.close();
		else await browser.disconnect();

		server.close();

	}

}

main().catch( ( error ) => {

	console.error( error.message );
	process.exitCode = 1;

} );
