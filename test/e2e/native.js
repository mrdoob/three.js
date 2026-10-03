import { fork } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { register } from 'node:module';
import { setMaxListeners } from 'node:events';
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { scheduler, setTimeout as delay } from 'node:timers/promises';
import { vulkanEnvironment } from '@onirenaud/swiftshader-vulkan';
import browserExamples from './browser-examples.js';
import { Image as Screenshot } from './image.js';

// Each example gets a fresh module cache, deterministic state and native GPU lifetime.
export function capture( file, width, height ) {

	// Chrome runs WebGPU on SwiftShader, its bundled CPU Vulkan driver, on the CI runners, and the baselines were
	// captured with it. Dawn uses the same driver through @onirenaud/swiftshader-vulkan; VK_DRIVER_FILES overrides it.
	const env = { ...process.env };
	if ( ! env.VK_DRIVER_FILES && ! env.VK_ICD_FILENAMES ) Object.assign( env, vulkanEnvironment() );
	return new Promise( ( resolve, reject ) => {

		const child = fork( fileURLToPath( import.meta.url ), [ file, width, height ], {
			env, serialization: 'advanced', stdio: [ 'ignore', 'pipe', 'pipe', 'ipc' ], timeout: 300000, killSignal: 'SIGKILL'
		} );
		let output = '', result;
		child.stdout.on( 'data', data => output += data );
		child.stderr.on( 'data', data => output += data );
		child.on( 'message', message => result = message );
		const kill = () => child.kill( 'SIGKILL' );
		process.once( 'exit', kill );
		child.on( 'error', reject );
		child.on( 'exit', ( code, signal ) => {

			process.removeListener( 'exit', kill );
			if ( result?.browser ) resolve( result );
			else if ( code !== 0 || ! result?.data ) reject( new Error( `${ file }: ${ result?.error || output || 'No native capture' } (exit ${ signal || code })` ) );
			else resolve( new Screenshot( width, height, result.data ) );

		} );

	} );

}

if ( process.send ) {

	let browser, finished = false;
	const finish = result => {

		if ( finished ) return;
		finished = true;
		process.send( result, () => process.exit( result.error ? 1 : 0 ) );

	};

	const fail = error => finish( browser ? { browser } : { error: error.stack || String( error ) } );
	process.on( 'uncaughtException', fail );
	process.on( 'unhandledRejection', fail );
	const requireBrowser = reason => {

		browser = reason;
		throw new Error( `Browser required: ${ reason }` );

	};

	main( process.argv[ 2 ], Number( process.argv[ 3 ] ), Number( process.argv[ 4 ] ), requireBrowser ).then( data => finish( browser ? { browser } : { data } ), fail );

}

async function main( file, width, height, requireBrowser ) {

	if ( Object.hasOwn( browserExamples, file ) ) requireBrowser( browserExamples[ file ] );
	const url = new URL( `../../examples/${ file }.html`, import.meta.url );
	const html = readFileSync( url, 'utf8' );
	const scripts = [ ...html.matchAll( /<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi ) ];
	const modules = scripts.filter( ( [ , attributes ] ) => /type="module"/.test( attributes ) );
	if ( modules.length !== 1 || scripts.some( ( [ , attributes ] ) => /\bsrc=/.test( attributes ) ) ) requireBrowser( 'HTML script loading' );
	if ( ! /WebGLRenderer|WebGPURenderer/.test( modules[ 0 ][ 2 ] ) || /CSS2DRenderer|CSS3DRenderer|SVGRenderer/.test( modules[ 0 ][ 2 ] ) ) requireBrowser( 'DOM renderer' );
	if ( /PointerLockControls/.test( modules[ 0 ][ 2 ] ) ) requireBrowser( 'pointer lock' );
	const imports = JSON.parse( scripts.find( ( [ , attributes ] ) => /type="importmap"/.test( attributes ) )[ 2 ] ).imports;
	process.chdir( fileURLToPath( new URL( '.', url ) ) );
	const { installDOM, Canvas, registerImageDecoder, WebGLRenderingContext, WebGL2RenderingContext, getDisplayInfo } = await import( '@onirenaud/node-webgl' );
	// Chrome decodes JPEG with libjpeg-turbo; pure-JavaScript decoders differ from it by a few levels on about half of
	// the samples, which shows wherever a texture drives sampling positions. Embedded ICC profiles are ignored, like
	// WebGL uploads with UNPACK_COLORSPACE_CONVERSION_WEBGL set to NONE (which three.js uses). PNG is built in;
	// other formats need the browser.
	const { decode: decodeJPEG } = await import( '@cwasm/jpeg-turbo' );
	registerImageDecoder( {
		name: 'libjpeg-turbo',
		test: bytes => bytes[ 0 ] !== 0x89,
		decode: bytes => {

			if ( bytes[ 0 ] !== 0xff ) requireBrowser( 'browser image decoder' );
			const { width, height, data } = decodeJPEG( bytes );
			return { width, height, data: new Uint8Array( data.buffer, data.byteOffset, data.length ) };

		}
	} );
	installDOM( { baseDir: process.cwd(), innerWidth: width, innerHeight: height } );
	Object.assign( globalThis, { scheduler } );
	delete globalThis.OffscreenCanvas;
	const events = new EventTarget();
	setMaxListeners( 0, document, events );
	for ( const method of [ 'addEventListener', 'removeEventListener', 'dispatchEvent' ] ) globalThis[ method ] = events[ method ].bind( events );
	const Request = globalThis.Request;
	globalThis.Request = class extends Request {

		constructor( input, options ) {

			super( typeof input === 'string' ? new URL( input, url ) : input, options );

		}

	};
	globalThis.ProgressEvent = class extends Event {

		constructor( type, options ) {

			super( type ); Object.assign( this, options );

		}

	};
	for ( const name of [ 'DOMParser', 'AudioContext', 'webkitAudioContext', 'VideoFrame', 'VideoDecoder', 'XMLHttpRequest' ] ) {

		globalThis[ name ] = class {

			constructor() {

				requireBrowser( name );

			}

		};

	}

	for ( const method of [ 'createRange', 'querySelectorAll', 'getElementsByClassName', 'getElementsByTagName' ] ) document[ method ] = () => requireBrowser( `DOM ${ method }` );
	for ( const method of [ 'querySelector', 'querySelectorAll', 'getBoundingClientRect' ] ) HTMLElement.prototype[ method ] = () => requireBrowser( `DOM ${ method }` );
	for ( const property of [ 'clientWidth', 'clientHeight', 'offsetWidth', 'offsetHeight' ] ) Object.defineProperty( HTMLElement.prototype, property, { get: () => requireBrowser( `DOM ${ property }` ) } );
	HTMLElement.prototype.append = function ( ...children ) {

		for ( const child of children ) this.appendChild( child );

	};

	const createElement = document.createElement;
	const elements = new Map();
	const canvases = new Set();
	document.createElement = tag => {

		if ( [ 'video', 'audio', 'iframe' ].includes( tag ) ) requireBrowser( `<${ tag }>` );
		const element = createElement( tag );
		if ( tag === 'script' ) Object.defineProperty( element, 'src', { set: requireBrowser.bind( null, 'HTML script loading' ) } );
		element.ownerDocument = document;
		element.classList ||= createElement( 'div' ).classList;
		element.getRootNode = () => document;
		element.click = () => element.dispatchEvent( new Event( 'click' ) );
		return element;

	};

	document.createElementNS = ( ns, tag ) => {

		if ( ns !== 'http://www.w3.org/1999/xhtml' ) requireBrowser( `DOM namespace ${ ns }` );
		return document.createElement( tag );

	};

	for ( const [ attributes, tag, id ] of html.matchAll( /<([\w-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g ) ) {

		const element = document.createElement( tag );
		element.id = id;
		element.checked = /\bchecked\b/.test( attributes );
		element.value = attributes.match( /\bvalue="([^"]*)"/ )?.[ 1 ] || '';
		elements.set( id, element );

	}

	for ( const [ , attributes, source ] of scripts ) {

		const id = attributes.match( /\bid="([^"]+)"/ )?.[ 1 ];
		if ( id ) elements.get( id ).textContent = source;

	}

	document.getElementById = id => elements.get( id ) || null;
	document.querySelector = selector => {

		if ( selector === 'body' ) return document.body;
		if ( selector === 'head' ) return document.head;
		if ( /^#[\w-]+$/.test( selector ) ) return document.getElementById( selector.slice( 1 ) );
		requireBrowser( `DOM selector ${ selector }` );

	};

	// These controls are hidden by clean-page.js in browser captures too.
	globalThis._nativeGUI = class GUI extends EventTarget {

		constructor( object, property ) {

			super(); this.children = []; this.$children = document.createElement( 'div' ); this.object = object; this.property = property; this.domElement = document.createElement( 'div' ); this.paramList = { domElement: this.domElement }; this.controllers = []; this.folders = [];

		}
		add( object, property ) {

			const controller = new this.constructor( object, property ); this.controllers.push( controller ); return controller;

		}
		addColor( ...args ) {

			return this.add( ...args );

		}
		addFolder() {

			const folder = new this.constructor(); this.folders.push( folder ); return folder;

		}
		onChange( callback ) {

			this.callback = callback; return this;

		}
		setValue( value ) {

			this.object[ this.property ] = value; this.callback?.( value ); return this;

		}
		getValue() {

			return this.object[ this.property ];

		}

	};
	for ( const method of [ 'name', 'title', 'step', 'min', 'max', 'listen', 'open', 'close', 'show', 'hide', 'enable', 'disable', 'destroy', 'updateDisplay', 'onFinishChange', 'decimals', 'options', 'debounce' ] ) {

		globalThis._nativeGUI.prototype[ method ] = function () {

			return this;

		};

	}

	let pending = 0;
	const errors = [];
	const track = async promise => {

		pending ++;
		try {

			return await promise;

		} catch ( error ) {

			errors.push( error.stack || String( error ) );
			throw error;

		} finally {

			pending --;

		}

	};

	globalThis.Worker = class extends EventTarget {

		constructor( source, options = {} ) {

			super();
			this.tasks = new Set();
			if ( options.type === 'module' ) requireBrowser( 'module Worker' );
			this.worker = track( globalThis.fetch( source ).then( async response => {

				if ( ! response.ok ) throw new Error( `Worker ${ source }: HTTP ${ response.status }` );
				const worker = new Worker( new URL( './native-worker.js', import.meta.url ), { workerData: { source: await response.text(), url: String( source ) } } );
				worker.on( 'message', data => {

					if ( data.type !== 'warning' && this.tasks.delete( data.id ) ) pending --; const event = new MessageEvent( 'message', { data } ); this.onmessage?.( event ); this.dispatchEvent( event );

				} );
				worker.on( 'error', error => errors.push( error.stack ) );
				return worker;

			} ) );

		}
		postMessage( message, transfer ) {

			if ( [ 'decode', 'transcode' ].includes( message.type ) ) {

				this.tasks.add( message.id ); pending ++;

			}

			this.worker.then( worker => worker.postMessage( message, transfer ) );

		}
		terminate() {

			return this.worker.then( worker => worker.terminate() );

		}

	};

	globalThis._nativeLoading = delta => pending += delta;
	globalThis._nativeLoadError = path => errors.push( `Failed to load ${ path }` );
	for ( const name of [ 'instantiate', 'instantiateStreaming' ] ) {

		const instantiate = WebAssembly[ name ];
		WebAssembly[ name ] = ( ...args ) => track( instantiate( ...args ) );

	}

	// Timers run against a virtual clock before the first frame, so waiting does not depend on how busy the machine
	// is. In the browser flow, timers keep firing while the runner waits for the network to settle (0.5 s to detect it,
	// 2 s idle time, then polling), which drives physics steps, spawners, tweens and progressive setup; measured
	// against Chrome, an interval fires as if 2632 ms passed (timer delays are whole milliseconds, at least 4).
	// A timer is awaited when it would fire within a two-second startup window, counted from the timer that scheduled
	// it and with the browser's 4 ms clamp on nested timers, so a setTimeout chain ends like it does there. Intervals
	// all start together, ticks that fall due together fire in registration order, and the ticks are replayed in
	// order right before the frame.
	const timers = new Map();
	let current = { time: 0, level: 0 };
	const intervals = new Map();
	let intervalId = 0;
	globalThis.setInterval = ( callback, milliseconds = 0, ...args ) => {

		const period = Math.max( 4, Math.trunc( Number( milliseconds ) ) || 0 );
		const id = { toString: () => `interval ${ ++ intervalId }` };
		intervals.set( id, { callback, args, period, next: current.time + period } );
		return id;

	};

	globalThis.clearInterval = id => intervals.delete( id ) || clearTimeout( id );
	const replayIntervals = window => {

		for ( let due; ( due = [ ...intervals.values() ].filter( timer => timer.next <= window ).sort( ( a, b ) => a.next - b.next )[ 0 ] ); ) {

			due.next += due.period;
			due.callback( ...due.args );

		}

	};

	const schedule = globalThis.setTimeout;
	globalThis.setTimeout = ( callback, milliseconds = 0, ...args ) => {

		const level = current.level + 1;
		const context = { time: current.time + Math.max( level > 5 ? 4 : 0, Math.trunc( Number( milliseconds ) ) || 0 ), level };
		if ( globalThis._renderStarted || context.time > 2000 ) return schedule( callback, milliseconds, ...args );
		pending ++;
		const id = schedule( ( ...values ) => {

			if ( timers.delete( id ) ) pending --;
			// Timers scheduled by the callback and by its promise continuations count as nested.
			const previous = current;
			current = context;
			try {

				callback( ...values );

			} finally {

				queueMicrotask( () => current = previous );

			}

		}, milliseconds, ...args );
		timers.set( id, true );
		return id;

	};

	const cancel = globalThis.clearTimeout;
	globalThis.clearTimeout = id => {

		if ( intervals.delete( id ) ) return;
		if ( timers.delete( id ) ) pending --; cancel( id );

	};

	const bitmap = globalThis.createImageBitmap;
	globalThis.createImageBitmap = ( ...args ) => track( bitmap( ...args ) );
	const imageSource = Object.getOwnPropertyDescriptor( globalThis.Image.prototype, 'src' );
	Object.defineProperty( globalThis.Image.prototype, 'src', {
		...imageSource,
		set( value ) {

			pending ++;
			const complete = event => {

				pending --;
				this.removeEventListener( 'load', complete );
				this.removeEventListener( 'error', complete );
				if ( event.type === 'error' ) errors.push( event.message );

			};

			this.addEventListener( 'load', complete );
			this.addEventListener( 'error', complete );
			// Resolved against the page like the browser does; blob: and data: URLs pass through fetch unchanged.
			track( globalThis.fetch( new URL( value, url ).href ).then( response => response.arrayBuffer() ).then( buffer => {

				imageSource.set.call( this, `data:;base64,${ Buffer.from( buffer ).toString( 'base64' ) }` );

			} ).catch( error => this.dispatchEvent( Object.assign( new Event( 'error' ), { message: `${ value }: ${ error.message }` } ) ) ) );

		}
	} );
	const fetch = globalThis.fetch;
	globalThis.fetch = ( ...args ) => track( fetch( ...args ) );
	const error = console.error;
	console.error = ( ...args ) => {

		errors.push( args.join( ' ' ) ); error( ...args );

	};

	register( './native-loader.js', import.meta.url, { data: { pageURL: url.href, pageSource: modules[ 0 ][ 2 ], imports } } );
	await import( './deterministic-injection.js' );
	const frames = new Map();
	let frameId = 0;
	globalThis.requestAnimationFrame = callback => {

		if ( ! globalThis._renderFinished ) frames.set( ++ frameId, callback );
		return frameId;

	};

	globalThis.cancelAnimationFrame = id => frames.delete( id );

	const gpuContexts = new Map();
	const { create, globals } = await import( 'webgpu' );
	Object.assign( globalThis, globals );
	const backend = process.platform === 'darwin' ? 'metal' : process.platform === 'win32' ? 'd3d12' : 'vulkan';
	navigator.gpu = create( [ `backend=${ backend }` ] );
	const requestAdapter = navigator.gpu.requestAdapter.bind( navigator.gpu );
	navigator.gpu.requestAdapter = options => track( requestAdapter( options ).then( adapter => {

		if ( ! adapter ) throw new Error( `No native WebGPU adapter for ${ backend }` );
		const requestDevice = adapter.requestDevice.bind( adapter );
		adapter.requestDevice = options => track( requestDevice( options ).then( device => {

			for ( const name of [ 'createRenderPipelineAsync', 'createComputePipelineAsync' ] ) {

				const method = device[ name ].bind( device );
				device[ name ] = ( ...args ) => track( method( ...args ) );

			}

			device.addEventListener( 'uncapturederror', event => errors.push( event.error.message ) );
			device.lost.then( info => errors.push( `WebGPU device lost: ${ info.message }` ) );
			device.queue.copyExternalImageToTexture = ( source, destination, size ) => {

				try {

					if ( ! /^rgba8unorm(-srgb)?$/.test( destination.texture.format ) ) throw new Error( `Unsupported image upload format: ${ destination.texture.format }` );
					const image = source.source._toRGBA8();
					const data = new Uint8Array( size.width * size.height * 4 );
					for ( let y = 0; y < size.height; y ++ ) {

						const offset = ( ( source.flipY ? image.height - 1 - y : y ) * image.width ) * 4;
						data.set( image.data.subarray( offset, offset + size.width * 4 ), y * size.width * 4 );

					}

					if ( destination.premultipliedAlpha ) for ( let i = 0; i < data.length; i += 4 ) for ( let c = 0; c < 3; c ++ ) data[ i + c ] = Math.round( data[ i + c ] * data[ i + 3 ] / 255 );
					device.queue.writeTexture( destination, data, { bytesPerRow: size.width * 4 }, size );

				} catch ( error ) {

					errors.push( error.message ); throw error;

				}

			};

			return device;

		} ) );
		return adapter;

	} ) );
	// Chrome on the ubuntu-latest runners drives WebGL through ANGLE's OpenGL backend on Mesa llvmpipe and exposes
	// exactly these extensions; the baselines were captured with them. node-webgl on the same Mesa driver offers
	// a different set (ASTC/ETC, timer queries), which examples like webgl_loader_texture_ktx would render differently.
	const browserExtensions = new Set( [
		'EXT_clip_control', 'EXT_color_buffer_float', 'EXT_color_buffer_half_float', 'EXT_conservative_depth', 'EXT_depth_clamp',
		'EXT_float_blend', 'EXT_polygon_offset_clamp', 'EXT_render_snorm', 'EXT_texture_compression_bptc', 'EXT_texture_compression_rgtc',
		'EXT_texture_filter_anisotropic', 'EXT_texture_mirror_clamp_to_edge', 'EXT_texture_norm16', 'KHR_parallel_shader_compile',
		'NV_shader_noperspective_interpolation', 'OES_draw_buffers_indexed', 'OES_sample_variables', 'OES_shader_multisample_interpolation',
		'OES_texture_float_linear', 'OVR_multiview2', 'WEBGL_blend_func_extended', 'WEBGL_clip_cull_distance', 'WEBGL_compressed_texture_s3tc',
		'WEBGL_compressed_texture_s3tc_srgb', 'WEBGL_debug_renderer_info', 'WEBGL_debug_shaders', 'WEBGL_lose_context', 'WEBGL_multi_draw',
		'WEBGL_polygon_mode', 'WEBGL_provoking_vertex', 'WEBGL_stencil_texturing'
	] );
	for ( const Context of [ WebGLRenderingContext, WebGL2RenderingContext ] ) {

		const { getSupportedExtensions, getExtension } = Context.prototype;
		const mesa = () => getDisplayInfo()?.angle === false;
		Context.prototype.getSupportedExtensions = function () {

			const extensions = getSupportedExtensions.call( this );
			return mesa() ? extensions?.filter( name => browserExtensions.has( name ) ) : extensions;

		};

		Context.prototype.getExtension = function ( name ) {

			return mesa() && ! browserExtensions.has( String( name ) ) ? null : getExtension.call( this, name );

		};

	}

	const getContext = Canvas.prototype.getContext;
	Canvas.prototype.getContext = function ( type, options ) {

		if ( type === '2d' || type === 'bitmaprenderer' ) requireBrowser( `canvas ${ type }` );
		canvases.add( this );
		if ( type !== 'webgpu' ) return getContext.call( this, type, options );

		if ( ! gpuContexts.has( this ) ) {

			let config, texture;
			gpuContexts.set( this, {
				canvas: this,
				configure( value ) {

					config = value;

				},
				get device() {

					return config.device;

				},
				getCurrentTexture() {

					if ( ! texture || texture.width !== this.canvas.width || texture.height !== this.canvas.height ) {

						texture?.destroy();
						texture = config.device.createTexture( { size: [ this.canvas.width, this.canvas.height ], format: config.format, usage: config.usage | GPUTextureUsage.COPY_SRC } );

					}

					return texture;

				}
			} );

		}

		return gpuContexts.get( this );

	};

	const THREE = await import( 'three' );
	for ( const Loader of [ THREE.FileLoader, THREE.ImageLoader, THREE.ImageBitmapLoader, THREE.TextureLoader, THREE.CubeTextureLoader ] ) {

		const load = Loader.prototype.load;
		Loader.prototype.load = function ( path, onLoad, ...args ) {

			return load.call( this, path, ( ...values ) => {

				const result = onLoad?.( ...values );
				if ( result?.then ) track( result );
				return result;

			}, ...args );

		};

	}

	await import( url.href );
	globalThis.onload?.( new Event( 'load' ) );
	globalThis.dispatchEvent( new Event( 'load' ) );
	document.getElementById( 'startButton' )?.click();
	async function ready() {

		// Let loader callbacks and renderer initialization finish before releasing RAF.
		do {

			await delay( 10 ); if ( errors.length ) throw new Error( errors.join( '\n' ) );

		} while ( pending );

	}

	await ready();
	replayIntervals( 2632 );
	await ready();
	globalThis._renderStarted = globalThis._renderFinished = true;
	for ( const callback of frames.values() ) await callback( 0 );
	await ready();
	if ( canvases.size === 0 ) throw new Error( 'The example did not render a canvas.' );
	if ( canvases.size > 1 ) requireBrowser( `DOM composition of ${ canvases.size } canvases` );
	const canvas = [ ...canvases ][ 0 ];
	if ( canvas.style.background || canvas.style.backgroundColor ) requireBrowser( 'CSS canvas background' );
	if ( canvas.width !== width || canvas.height !== height ) requireBrowser( 'CSS canvas sizing' );
	let data;
	const context = gpuContexts.get( canvas );
	if ( context ) {

		const texture = context.getCurrentTexture();
		if ( ! [ 'bgra8unorm', 'rgba8unorm' ].includes( texture.format ) ) requireBrowser( `HDR canvas composition (${ texture.format })` );
		const stride = Math.ceil( width * 4 / 256 ) * 256;
		const buffer = context.device.createBuffer( { size: stride * height, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ } );
		const encoder = context.device.createCommandEncoder();
		encoder.copyTextureToBuffer( { texture }, { buffer, bytesPerRow: stride }, [ width, height ] );
		context.device.queue.submit( [ encoder.finish() ] );
		await buffer.mapAsync( GPUMapMode.READ );
		const pixels = new Uint8Array( buffer.getMappedRange() );
		data = Buffer.alloc( width * height * 4 );
		for ( let y = 0; y < height; y ++ ) data.set( pixels.subarray( y * stride, y * stride + width * 4 ), y * width * 4 );
		if ( texture.format === 'bgra8unorm' ) for ( let i = 0; i < data.length; i += 4 ) [ data[ i ], data[ i + 2 ] ] = [ data[ i + 2 ], data[ i ] ];
		buffer.unmap();
		buffer.destroy();

	} else {

		data = Buffer.from( canvas.getImageData().data );

	}

	await ready();
	// The gallery's canvas is composited over its black page background.
	for ( let i = 3; i < data.length; i += 4 ) data[ i ] = 255;
	return data;

}
