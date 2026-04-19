// Perf/VRAM regression harness for WebGPU examples.
//
// Usage:
//   node test/e2e/perf-regression.js <label> <example> [durationMs] [warmupMs]
//
// Collects per-window: JS heap (used/total), frame timing (rAF), GC events,
// and WebGPU resource counts via a minimal API interceptor (buffers, textures,
// bind groups, pipelines, shader modules, samplers, submits, render/compute
// passes, uncaptured errors). Dumps JSON to test/e2e/perf-regression-<label>-<example>.json.
//
// Compare two runs with test/e2e/perf-regression-compare.js.
//
// Self-contained: relies only on puppeteer (already a dev dependency) and three.js's own server.

import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';
import * as fs from 'node:fs/promises';

const [ , , label, example, durationArg, warmupArg ] = process.argv;

if ( ! label || ! example ) {

	console.error( 'usage: node test/e2e/perf-regression.js <label> <example> [durationMs=10000] [warmupMs=3000]' );
	process.exit( 1 );

}

const port = 1240;
const duration = parseInt( durationArg, 10 ) || 10_000;
const warmup = parseInt( warmupArg, 10 ) || 3_000;
const heapSampleMs = 50;
const gcDropThresholdPct = 3;

const server = createServer();
await new Promise( r => server.listen( port, r ) );

const browser = await puppeteer.launch( {
	headless: 'new',
	args: [
		'--enable-unsafe-webgpu',
		'--ignore-gpu-blocklist',
		'--disable-gpu-driver-bug-workarounds',
		'--no-sandbox',
		'--enable-precise-memory-info'
	],
	defaultViewport: { width: 1280, height: 720 },
	protocolTimeout: 0
} );

const page = await browser.newPage();

// Inject before any page script runs.
await page.evaluateOnNewDocument( `(${ injectedClientJS.toString() })();` );

page.on( 'pageerror', ( err ) => console.error( `[page error] ${ err.message }` ) );
page.on( 'console', ( msg ) => {

	if ( msg.type() === 'error' ) console.error( `[page console.error] ${ msg.text() }` );

} );

const url = `http://localhost:${ port }/examples/${ example }.html`;
console.log( `[${ label }] ${ example } — loading ${ url }` );
await page.goto( url, { waitUntil: 'networkidle2', timeout: 60_000 } );

console.log( `[${ label }] warmup ${ warmup }ms` );
await new Promise( r => setTimeout( r, warmup ) );

console.log( `[${ label }] sampling ${ duration }ms` );
await page.evaluate( ( heapSampleMs ) => window.__perfStart( heapSampleMs ), heapSampleMs );

const snapshotBefore = await page.evaluate( () => window.__wgpuSnapshot() );

await new Promise( r => setTimeout( r, duration ) );

const snapshotAfter = await page.evaluate( () => window.__wgpuSnapshot() );
const raw = await page.evaluate( () => window.__perfStop() );

await browser.close();
server.close();

// Aggregate.
const pct = ( arr, p ) => arr.length ? arr[ Math.min( arr.length - 1, Math.floor( arr.length * p / 100 ) ) ] : 0;
const mean = arr => arr.length ? arr.reduce( ( s, v ) => s + v, 0 ) / arr.length : 0;

const frames = raw.frames.slice().sort( ( a, b ) => a - b );
const used = raw.heap.map( h => h.used );

const gcEvents = [];
for ( let i = 1; i < raw.heap.length; i ++ ) {

	const drop = raw.heap[ i - 1 ].used - raw.heap[ i ].used;
	if ( drop > raw.heap[ i - 1 ].used * ( gcDropThresholdPct / 100 ) ) gcEvents.push( { t: raw.heap[ i ].t, drop } );

}

const cmdSubmits = snapshotAfter.cmdSubmits - snapshotBefore.cmdSubmits;
const renderPasses = snapshotAfter.renderPasses - snapshotBefore.renderPasses;
const computePasses = snapshotAfter.computePasses - snapshotBefore.computePasses;
const framesInWindow = raw.frames.length;

const summary = {
	label,
	example,
	durationMs: duration,
	warmupMs: warmup,
	frames: framesInWindow,
	fps: framesInWindow ? 1000 / mean( raw.frames ) : 0,
	frameTimeMs: {
		mean: mean( frames ),
		p50: pct( frames, 50 ),
		p95: pct( frames, 95 ),
		p99: pct( frames, 99 ),
		max: frames[ frames.length - 1 ] || 0
	},
	jsHeapBytes: {
		samples: used.length,
		min: used.length ? Math.min( ...used ) : 0,
		max: used.length ? Math.max( ...used ) : 0,
		mean: mean( used ),
		start: used[ 0 ] || 0,
		end: used[ used.length - 1 ] || 0,
		growth: ( used[ used.length - 1 ] || 0 ) - ( used[ 0 ] || 0 )
	},
	gc: {
		events: gcEvents.length,
		totalFreedBytes: gcEvents.reduce( ( s, e ) => s + e.drop, 0 ),
		eventsPerSec: gcEvents.length / ( duration / 1000 )
	},
	webgpu: {
		// Live counts at start and end of window
		liveBuffersBefore: snapshotBefore.liveBuffers,
		liveBuffersAfter: snapshotAfter.liveBuffers,
		liveBuffersDelta: snapshotAfter.liveBuffers - snapshotBefore.liveBuffers,
		liveTexturesBefore: snapshotBefore.liveTextures,
		liveTexturesAfter: snapshotAfter.liveTextures,
		liveTexturesDelta: snapshotAfter.liveTextures - snapshotBefore.liveTextures,
		// Estimated VRAM (tracked by buffer+texture byteLength)
		estimatedVRAMBefore: snapshotBefore.estimatedVRAMBytes,
		estimatedVRAMAfter: snapshotAfter.estimatedVRAMBytes,
		estimatedVRAMDelta: snapshotAfter.estimatedVRAMBytes - snapshotBefore.estimatedVRAMBytes,
		// Cumulative create counters
		shaderModules: snapshotAfter.shaderModules,
		renderPipelines: snapshotAfter.renderPipelines,
		computePipelines: snapshotAfter.computePipelines,
		bindGroupsTotalBefore: snapshotBefore.bindGroupsTotal,
		bindGroupsTotalAfter: snapshotAfter.bindGroupsTotal,
		bindGroupsTotalDelta: snapshotAfter.bindGroupsTotal - snapshotBefore.bindGroupsTotal,
		samplersBefore: snapshotBefore.samplers,
		samplersAfter: snapshotAfter.samplers,
		samplersDelta: snapshotAfter.samplers - snapshotBefore.samplers,
		// Command rate within window
		cmdSubmits,
		renderPasses,
		computePasses,
		cmdSubmitsPerFrame: framesInWindow ? cmdSubmits / framesInWindow : 0,
		renderPassesPerFrame: framesInWindow ? renderPasses / framesInWindow : 0,
		computePassesPerFrame: framesInWindow ? computePasses / framesInWindow : 0,
		// Errors
		errors: snapshotAfter.errors - snapshotBefore.errors
	}
};

const filename = `test/e2e/perf-regression-${ label }-${ example }.json`;
await fs.writeFile( filename, JSON.stringify( summary, null, 2 ) );

console.log( `\n[${ label }] wrote ${ filename }` );
console.log( JSON.stringify( summary, null, 2 ) );

process.exit( 0 );

// ---------------------------------------------------------------------------
// Client-side injection: WebGPU interceptor + perf sampler.
// Installed via `evaluateOnNewDocument` so it wraps GPUDevice on first acquire.
// ---------------------------------------------------------------------------

function injectedClientJS() {

	if ( window.__perfInstalled ) return;
	window.__perfInstalled = true;

	// --- WebGPU interceptor ---

	const stats = {
		liveBuffers: 0,
		liveTextures: 0,
		estimatedVRAMBytes: 0,
		shaderModules: 0,
		renderPipelines: 0,
		computePipelines: 0,
		bindGroupsTotal: 0,
		samplers: 0,
		cmdSubmits: 0,
		renderPasses: 0,
		computePasses: 0,
		errors: 0
	};

	window.__wgpuSnapshot = () => ( {
		liveBuffers: stats.liveBuffers,
		liveTextures: stats.liveTextures,
		estimatedVRAMBytes: stats.estimatedVRAMBytes,
		shaderModules: stats.shaderModules,
		renderPipelines: stats.renderPipelines,
		computePipelines: stats.computePipelines,
		bindGroupsTotal: stats.bindGroupsTotal,
		samplers: stats.samplers,
		cmdSubmits: stats.cmdSubmits,
		renderPasses: stats.renderPasses,
		computePasses: stats.computePasses,
		errors: stats.errors
	} );

	function formatBytesPerPixel( fmt ) {

		if ( ! fmt ) return 4;

		// Cheap heuristic covering common formats. For regression, absolute precision isn't critical — stability is.
		if ( fmt.endsWith( '32float' ) || fmt.endsWith( '32uint' ) || fmt.endsWith( '32sint' ) ) {

			const ch = fmt.startsWith( 'rgba' ) ? 4 : fmt.startsWith( 'rg' ) ? 2 : 1;
			return ch * 4;

		}

		if ( fmt.endsWith( '16float' ) || fmt.endsWith( '16uint' ) || fmt.endsWith( '16sint' ) || fmt.endsWith( '16unorm' ) || fmt.endsWith( '16snorm' ) ) {

			const ch = fmt.startsWith( 'rgba' ) ? 4 : fmt.startsWith( 'rg' ) ? 2 : 1;
			return ch * 2;

		}

		if ( fmt.indexOf( 'depth24plus-stencil8' ) >= 0 ) return 4;
		if ( fmt.indexOf( 'depth32float-stencil8' ) >= 0 ) return 5;
		if ( fmt.indexOf( 'depth24plus' ) >= 0 ) return 4;
		if ( fmt.indexOf( 'depth16unorm' ) >= 0 ) return 2;
		if ( fmt.indexOf( 'depth32float' ) >= 0 ) return 4;
		if ( fmt.indexOf( 'stencil8' ) >= 0 ) return 1;

		if ( fmt.startsWith( 'bc' ) || fmt.startsWith( 'etc' ) || fmt.startsWith( 'astc' ) ) return 1; // block-compressed approximation

		// rgba8unorm, bgra8unorm, etc.
		if ( fmt.startsWith( 'rgba' ) || fmt.startsWith( 'bgra' ) ) return 4;
		if ( fmt.startsWith( 'rg' ) ) return 2;
		return 1;

	}

	function estimateTextureBytes( desc ) {

		const w = ( desc.size && ( desc.size.width ?? desc.size[ 0 ] ) ) || 0;
		const h = ( desc.size && ( desc.size.height ?? desc.size[ 1 ] ) ) || 1;
		const d = ( desc.size && ( desc.size.depthOrArrayLayers ?? desc.size[ 2 ] ) ) || 1;
		const bpp = formatBytesPerPixel( desc.format || 'rgba8unorm' );
		const mips = desc.mipLevelCount || 1;
		const samples = desc.sampleCount || 1;
		let bytes = 0;
		for ( let m = 0; m < mips; m ++ ) {

			bytes += Math.max( 1, w >> m ) * Math.max( 1, h >> m ) * d * bpp;

		}

		return bytes * samples;

	}

	function wrapDevice( device ) {

		if ( device.__perfWrapped ) return;
		device.__perfWrapped = true;

		const origCreateBuffer = device.createBuffer.bind( device );
		device.createBuffer = function ( desc ) {

			const size = desc.size || 0;
			const buf = origCreateBuffer( desc );
			stats.liveBuffers ++;
			stats.estimatedVRAMBytes += size;
			const origDestroy = buf.destroy.bind( buf );
			let destroyed = false;
			buf.destroy = function () {

				if ( ! destroyed ) {

					destroyed = true;
					stats.liveBuffers = Math.max( 0, stats.liveBuffers - 1 );
					stats.estimatedVRAMBytes = Math.max( 0, stats.estimatedVRAMBytes - size );

				}

				return origDestroy();

			};

			return buf;

		};

		const origCreateTexture = device.createTexture.bind( device );
		device.createTexture = function ( desc ) {

			const bytes = estimateTextureBytes( desc );
			const tex = origCreateTexture( desc );
			stats.liveTextures ++;
			stats.estimatedVRAMBytes += bytes;
			const origDestroy = tex.destroy.bind( tex );
			let destroyed = false;
			tex.destroy = function () {

				if ( ! destroyed ) {

					destroyed = true;
					stats.liveTextures = Math.max( 0, stats.liveTextures - 1 );
					stats.estimatedVRAMBytes = Math.max( 0, stats.estimatedVRAMBytes - bytes );

				}

				return origDestroy();

			};

			return tex;

		};

		const origCreateShaderModule = device.createShaderModule.bind( device );
		device.createShaderModule = function ( desc ) {

			stats.shaderModules ++;
			return origCreateShaderModule( desc );

		};

		[ 'createRenderPipeline', 'createRenderPipelineAsync' ].forEach( name => {

			if ( ! device[ name ] ) return;
			const orig = device[ name ].bind( device );
			device[ name ] = function ( desc ) {

				stats.renderPipelines ++;
				return orig( desc );

			};

		} );

		[ 'createComputePipeline', 'createComputePipelineAsync' ].forEach( name => {

			if ( ! device[ name ] ) return;
			const orig = device[ name ].bind( device );
			device[ name ] = function ( desc ) {

				stats.computePipelines ++;
				return orig( desc );

			};

		} );

		const origCreateBindGroup = device.createBindGroup.bind( device );
		device.createBindGroup = function ( desc ) {

			stats.bindGroupsTotal ++;
			return origCreateBindGroup( desc );

		};

		if ( device.createSampler ) {

			const origCreateSampler = device.createSampler.bind( device );
			device.createSampler = function ( desc ) {

				stats.samplers ++;
				return origCreateSampler( desc );

			};

		}

		const origCreateCE = device.createCommandEncoder.bind( device );
		device.createCommandEncoder = function ( desc ) {

			const enc = origCreateCE( desc );
			const origBeginRP = enc.beginRenderPass.bind( enc );
			enc.beginRenderPass = function ( rpDesc ) {

				stats.renderPasses ++;
				return origBeginRP( rpDesc );

			};

			const origBeginCP = enc.beginComputePass.bind( enc );
			enc.beginComputePass = function ( cpDesc ) {

				stats.computePasses ++;
				return origBeginCP( cpDesc );

			};

			return enc;

		};

		if ( device.queue ) {

			const origSubmit = device.queue.submit.bind( device.queue );
			device.queue.submit = function ( buffers ) {

				stats.cmdSubmits ++;
				return origSubmit( buffers );

			};

		}

		try {

			device.addEventListener( 'uncapturederror', () => {

				stats.errors ++;

			} );

		} catch ( _ ) { /* some polyfills may not support addEventListener here */ }

	}

	// GPUAdapter.requestDevice is the only entry point for acquiring a device.
	if ( navigator.gpu && navigator.gpu.__proto__ ) {

		const origRequestAdapter = navigator.gpu.requestAdapter.bind( navigator.gpu );
		navigator.gpu.requestAdapter = async function ( ...args ) {

			const adapter = await origRequestAdapter( ...args );
			if ( adapter && ! adapter.__perfWrapped ) {

				adapter.__perfWrapped = true;
				const origRequestDevice = adapter.requestDevice.bind( adapter );
				adapter.requestDevice = async function ( ...devArgs ) {

					const device = await origRequestDevice( ...devArgs );
					wrapDevice( device );
					return device;

				};

			}

			return adapter;

		};

	}

	// --- JS heap + frame-time sampler ---

	window.__perf = { frames: [], heap: [], startT: null, lastRAF: null, heapTimerId: null };

	const origRAF = window.requestAnimationFrame.bind( window );
	window.requestAnimationFrame = ( cb ) => origRAF( ( t ) => {

		if ( window.__perf.startT !== null ) {

			const now = performance.now();
			if ( window.__perf.lastRAF !== null ) window.__perf.frames.push( now - window.__perf.lastRAF );
			window.__perf.lastRAF = now;

		}

		cb( t );

	} );

	window.__perfStart = ( heapSampleMs ) => {

		window.__perf.startT = performance.now();
		window.__perf.lastRAF = null;
		window.__perf.frames.length = 0;
		window.__perf.heap.length = 0;
		window.__perf.heapTimerId = setInterval( () => {

			if ( performance.memory ) {

				window.__perf.heap.push( {
					t: performance.now(),
					used: performance.memory.usedJSHeapSize,
					total: performance.memory.totalJSHeapSize
				} );

			}

		}, heapSampleMs || 50 );

	};

	window.__perfStop = () => {

		clearInterval( window.__perf.heapTimerId );
		return window.__perf;

	};

}
