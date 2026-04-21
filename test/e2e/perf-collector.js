// Shared perf-collection primitives used by perf-regression.js (single-run)
// and perf-regression-orchestrator.js (multi-iteration, persistent browser).
//
// Exports:
//   injectedClientJS         — function serialized into evaluateOnNewDocument
//   attachPerfInjection(page)
//   collectIteration(page, { url, warmup, duration, heapSampleMs })
//   buildSummary(raw, before, after, meta)

export async function attachPerfInjection( page ) {

	await page.evaluateOnNewDocument( `(${ injectedClientJS.toString() })();` );

}

export async function collectIteration( page, { url, warmup, duration, heapSampleMs = 50, onLog = () => {} } ) {

	onLog( `loading ${ url }` );
	// `load` fires once the document + all sub-resources have finished loading
	// (or errored out). Safer than `networkidle2` for WebGPU examples that
	// keep incidental connections alive.
	await page.goto( url, { waitUntil: 'load', timeout: 60_000 } );

	onLog( `warmup ${ warmup }ms` );
	await new Promise( r => setTimeout( r, warmup ) );

	onLog( `sampling ${ duration }ms` );
	await page.evaluate( ( ms ) => window.__perfStart( ms ), heapSampleMs );

	const before = await page.evaluate( () => window.__wgpuSnapshot() );
	await new Promise( r => setTimeout( r, duration ) );
	const after = await page.evaluate( () => window.__wgpuSnapshot() );
	const raw = await page.evaluate( () => window.__perfStop() );

	// Sanity check: if zero frames were recorded the renderer never started.
	// Common causes: WebGPU adapter request failed (Linux headless GPU path),
	// a page error before any rAF tick, or a misconfigured example. Fail loudly
	// here rather than silently producing a summary of zeros.
	if ( raw.frames.length === 0 ) {

		throw new Error( `no frames recorded during ${ duration }ms sample window — the renderer did not start. Check console errors above (WebGPU adapter null? WebGL context failed?).` );

	}

	return { raw, before, after };

}

export function buildSummary( raw, before, after, meta ) {

	const { label, example, durationMs, warmupMs, gcDropThresholdPct = 3 } = meta;

	const pct = ( arr, p ) => arr.length ? arr[ Math.min( arr.length - 1, Math.floor( arr.length * p / 100 ) ) ] : 0;
	const mean = arr => arr.length ? arr.reduce( ( s, v ) => s + v, 0 ) / arr.length : 0;

	const frames = raw.frames.slice().sort( ( a, b ) => a - b );
	const used = raw.heap.map( h => h.used );

	const gcEvents = [];
	for ( let i = 1; i < raw.heap.length; i ++ ) {

		const drop = raw.heap[ i - 1 ].used - raw.heap[ i ].used;
		if ( drop > raw.heap[ i - 1 ].used * ( gcDropThresholdPct / 100 ) ) gcEvents.push( { t: raw.heap[ i ].t, drop } );

	}

	const cmdSubmits = after.cmdSubmits - before.cmdSubmits;
	const renderPasses = after.renderPasses - before.renderPasses;
	const computePasses = after.computePasses - before.computePasses;
	const framesInWindow = raw.frames.length;

	return {
		label,
		example,
		durationMs,
		warmupMs,
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
			eventsPerSec: gcEvents.length / ( durationMs / 1000 )
		},
		webgpu: {
			liveBuffersBefore: before.liveBuffers,
			liveBuffersAfter: after.liveBuffers,
			liveBuffersDelta: after.liveBuffers - before.liveBuffers,
			liveTexturesBefore: before.liveTextures,
			liveTexturesAfter: after.liveTextures,
			liveTexturesDelta: after.liveTextures - before.liveTextures,
			estimatedVRAMBefore: before.estimatedVRAMBytes,
			estimatedVRAMAfter: after.estimatedVRAMBytes,
			estimatedVRAMDelta: after.estimatedVRAMBytes - before.estimatedVRAMBytes,
			shaderModules: after.shaderModules,
			renderPipelines: after.renderPipelines,
			computePipelines: after.computePipelines,
			bindGroupsTotalBefore: before.bindGroupsTotal,
			bindGroupsTotalAfter: after.bindGroupsTotal,
			bindGroupsTotalDelta: after.bindGroupsTotal - before.bindGroupsTotal,
			samplersBefore: before.samplers,
			samplersAfter: after.samplers,
			samplersDelta: after.samplers - before.samplers,
			cmdSubmits,
			renderPasses,
			computePasses,
			cmdSubmitsPerFrame: framesInWindow ? cmdSubmits / framesInWindow : 0,
			renderPassesPerFrame: framesInWindow ? renderPasses / framesInWindow : 0,
			computePassesPerFrame: framesInWindow ? computePasses / framesInWindow : 0,
			errors: after.errors - before.errors
		}
	};

}

// ---------------------------------------------------------------------------
// Client-side injection. Installed via evaluateOnNewDocument so it wraps
// GPUDevice on first acquire. Safe to install once per browser context.
// ---------------------------------------------------------------------------

export function injectedClientJS() {

	if ( window.__perfInstalled ) return;
	window.__perfInstalled = true;

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

	window.__wgpuSnapshot = () => ( { ...stats } );

	function formatBytesPerPixel( fmt ) {

		if ( ! fmt ) return 4;

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

		if ( fmt.startsWith( 'bc' ) || fmt.startsWith( 'etc' ) || fmt.startsWith( 'astc' ) ) return 1;

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

		} catch ( _ ) {}

	}

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
		window.__perf.startT = null;
		return {
			frames: window.__perf.frames.slice(),
			heap: window.__perf.heap.slice()
		};

	};

}
