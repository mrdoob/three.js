import {
	AmbientLight, BoxGeometry, Color, DirectionalLight,
	Mesh, MeshPhongMaterial,
	NoBlending, OrthographicCamera, PerspectiveCamera, PlaneGeometry, Scene,
	SphereGeometry, UnsignedIntType, WebGLRenderer, WebGLRenderTarget
} from 'three';
import { GBufferPass } from '../../examples/jsm/postprocessing/GBufferPass.js';
import { SSAOPass } from '../../examples/jsm/postprocessing/SSAOPass.js';
import { SSRPass } from '../../examples/jsm/postprocessing/SSRPass.js';

const parameters = new URLSearchParams( window.location.search );
const width = Number( parameters.get( 'size' ) ) || 256, height = width;
const detail = Number( parameters.get( 'detail' ) ) || 20;
const renderer = new WebGLRenderer( { antialias: false } );
renderer.setSize( width, height );
renderer.info.autoReset = false;
const gl = renderer.getContext();
const timer = gl.getExtension( 'EXT_disjoint_timer_query_webgl2' );
const scene = new Scene();
scene.background = new Color( 0x223344 );
scene.add( new AmbientLight( 0xffffff, 1 ) );
const light = new DirectionalLight( 0xffffff, 2 );
light.position.set( 3, 8, 5 );
scene.add( light );
const camera = new PerspectiveCamera( 50, 1, 0.1, 30 );
camera.position.set( 5, 4, 7 );
camera.lookAt( 0, 0.6, 0 );
camera.updateMatrixWorld();
const ground = new Mesh( new PlaneGeometry( 16, 16 ), new MeshPhongMaterial( { color: 0x888888 } ) );
ground.rotation.x = - Math.PI / 2;
scene.add( ground );
for ( let i = 0; i < 24; i ++ ) {

	const mesh = new Mesh( i % 2 ? new BoxGeometry( 0.7, 1, 0.7 ) : new SphereGeometry( 0.5, detail, Math.max( 12, detail / 2 ) ), new MeshPhongMaterial( { color: new Color().setHSL( i / 24, 0.7, 0.5 ) } ) );
	mesh.position.set( ( i % 6 - 2.5 ) * 1.1, 0.5, ( Math.floor( i / 6 ) - 1.5 ) * 1.1 );
	scene.add( mesh );

}

const gBufferPass = new GBufferPass( scene, camera, width, height );
const source = new WebGLRenderTarget( width, height );
const output = new WebGLRenderTarget( width, height, { depthBuffer: false } );
const ssao = new SSAOPass( scene, camera, width, height );
const ssr = new SSRPass( { renderer, scene, camera, width, height, selects: [ ground ] } );
// Optional controlled comparison: use 24-bit depth for both paths, preserving SSR's
// default 16-bit depth unless explicitly requested by the benchmark URL.
const ssrDepthBits = parameters.get( 'depth' ) === '24' ? 24 : 16;
if ( ssrDepthBits === 24 ) ssr.beautyRenderTarget.depthTexture.type = UnsignedIntType;
function renderPrepass() {

	gBufferPass.render( renderer );

}

function readOutput() {

	const pixels = new Uint8Array( width * height * 4 );
	renderer.readRenderTargetPixels( output, 0, 0, width, height, pixels );
	return pixels;

}

function renderEffect( pass ) {

	if ( pass === ssao ) {

		renderer.setRenderTarget( source );
		renderer.render( scene, pass.camera );
		pass.render( renderer, output, source );
		// SSAO writes to readBuffer by design.
		renderer.setRenderTarget( output );
		ssr.copyMaterial.uniforms.tDiffuse.value = source.texture;
		ssr.copyMaterial.blending = NoBlending;
		ssr._renderPass( renderer, ssr.copyMaterial, output );

	} else {

		pass.render( renderer, output, source );

	}

}

function compare( pass, mode, input = { depthTexture: gBufferPass.depthTexture, texture: gBufferPass.normalTexture } ) {

	pass.output = mode;
	pass.setGBuffer();
	renderEffect( pass );
	const internal = readOutput();
	pass.setGBuffer( input.depthTexture, input.texture );
	renderPrepass();
	renderEffect( pass );
	const external = readOutput();
	let max = 0, sum = 0, different = 0;
	for ( let i = 0; i < internal.length; i ++ ) {

		const difference = Math.abs( internal[ i ] - external[ i ] );
		max = Math.max( max, difference );
		sum += difference;
		if ( difference > 1 ) different ++;

	}

	return { maxChannelError: max, meanChannelError: sum / internal.length, channelsBeyondOne: different, internal, external };

}

function showImage( pixels, label ) {

	const canvas = document.createElement( 'canvas' );
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext( '2d' );
	const flipped = new Uint8ClampedArray( pixels.length );
	for ( let y = 0; y < height; y ++ ) {

		flipped.set( pixels.subarray( y * width * 4, ( y + 1 ) * width * 4 ), ( height - 1 - y ) * width * 4 );

	}

	context.putImageData( new ImageData( flipped, width, height ), 0, 0 );
	const figure = document.createElement( 'figure' );
	const caption = document.createElement( 'figcaption' );
	caption.textContent = label;
	figure.append( canvas, caption );
	document.querySelector( '#images' ).append( figure );

}

let geometryRenders = 0;

const nextFrame = () => new Promise( resolve => requestAnimationFrame( resolve ) );

async function measure( frame ) {

	const warmup = timer ? gl.createQuery() : null;
	if ( warmup ) gl.beginQuery( timer.TIME_ELAPSED_EXT, warmup );
	for ( let i = 0; i < 100; i ++ ) frame();
	if ( warmup ) {

		gl.endQuery( timer.TIME_ELAPSED_EXT );
		const deadline = performance.now() + 10000;
		while ( ! gl.getQueryParameter( warmup, gl.QUERY_RESULT_AVAILABLE ) && performance.now() < deadline ) await nextFrame();
		gl.deleteQuery( warmup );

	} else {

		await nextFrame();

	}

	const samples = [];
	let drawCalls, sceneRenders;
	for ( let batch = 0; batch < 5; batch ++ ) {

		await nextFrame();
		const query = timer ? gl.createQuery() : null;
		if ( query ) gl.beginQuery( timer.TIME_ELAPSED_EXT, query );
		const start = performance.now();
		for ( let i = 0; i < 10; i ++ ) {

			renderer.info.reset();
			geometryRenders = 0;
			frame();
			sceneRenders = geometryRenders;
			drawCalls = renderer.info.render.calls;

		}

		if ( query ) gl.endQuery( timer.TIME_ELAPSED_EXT );
		const wallMs = ( performance.now() - start ) / 10;
		let gpuMs = null;
		if ( query ) {

			const deadline = performance.now() + 10000;
			while ( ! gl.getQueryParameter( query, gl.QUERY_RESULT_AVAILABLE ) && performance.now() < deadline ) await nextFrame();
			if ( gl.getQueryParameter( query, gl.QUERY_RESULT_AVAILABLE ) && ! gl.getParameter( timer.GPU_DISJOINT_EXT ) ) gpuMs = gl.getQueryParameter( query, gl.QUERY_RESULT ) / 1e7;
			gl.deleteQuery( query );

		}

		samples.push( { wallMs, gpuMs } );

	}

	const median = values => values.sort( ( a, b ) => a - b )[ Math.floor( values.length / 2 ) ];
	const gpu = samples.map( sample => sample.gpuMs ).filter( value => value !== null );
	return { samples, sceneRenders, drawCalls, gpuMs: gpu.length ? median( gpu ) : null, cpuSubmitMs: median( samples.map( sample => sample.wallMs ) ) };

}

// Count GPU-completed frames over a wall-clock window, without timer queries or
// refresh-rate pacing. A bounded queue prevents counting unexecuted submissions.
const throughputChannel = new MessageChannel();
let resumeThroughput;
throughputChannel.port1.onmessage = () => resumeThroughput();
const yieldThroughput = () => new Promise( resolve => {

	resumeThroughput = resolve;
	throughputChannel.port2.postMessage( null );

} );

async function countFrames( frame, durationMs ) {

	const batchSize = Number( parameters.get( 'batch' ) ) || ( width >= 512 ? 1 : 8 );
	const queue = [];
	let completedFrames = 0, submittedFrames = 0;
	const start = performance.now();
	const deadline = start + durationMs;
	while ( performance.now() < deadline ) {

		while ( queue.length ) {

			const status = gl.clientWaitSync( queue[ 0 ], 0, 0 );
			if ( status === gl.WAIT_FAILED ) throw new Error( 'GPU fence wait failed.' );
			if ( status !== gl.ALREADY_SIGNALED && status !== gl.CONDITION_SATISFIED ) break;
			gl.deleteSync( queue.shift() );
			completedFrames += batchSize;

		}

		while ( queue.length < 3 && performance.now() < deadline ) {

			for ( let i = 0; i < batchSize; i ++ ) frame();
			queue.push( gl.fenceSync( gl.SYNC_GPU_COMMANDS_COMPLETE, 0 ) );
			gl.flush();
			submittedFrames += batchSize;

		}

		await yieldThroughput();

	}

	const elapsedMs = performance.now() - start;
	const pendingFramesAtDeadline = submittedFrames - completedFrames;
	// Drain outstanding work before changing the implementation or starting another run.
	const drainStart = performance.now();
	while ( queue.length ) {

		const status = gl.clientWaitSync( queue[ 0 ], 0, 0 );
		if ( status === gl.WAIT_FAILED ) throw new Error( 'GPU fence wait failed.' );
		if ( status === gl.ALREADY_SIGNALED || status === gl.CONDITION_SATISFIED ) gl.deleteSync( queue.shift() );
		else await yieldThroughput();

	}

	return { completedFrames, elapsedMs, framesPerSecond: completedFrames * 1000 / elapsedMs, submittedFrames, pendingFramesAtDeadline, drainMs: performance.now() - drainStart, batchSize, maxFramesInFlight: 3 * batchSize };

}

window.sharedBuffersResult = ( async () => {

	const comparisons = [];
	for ( const pass of [ ssao, ssr ] ) {

		const modes = pass === ssao ? [ 'SSAO', 'Blur', 'Depth', 'Normal', 'Default' ] : [ 'SSR', 'Depth', 'Normal', 'Beauty', 'Default', 'Metalness' ];
		for ( const mode of modes ) {

			const result = compare( pass, pass.constructor.OUTPUT[ mode ] );
			comparisons.push( { effect: pass.constructor.name, mode, maxChannelError: result.maxChannelError, meanChannelError: result.meanChannelError, channelsBeyondOne: result.channelsBeyondOne } );
			if ( mode === 'Default' ) {

				showImage( result.internal, pass.constructor.name + ' internal' );
				showImage( result.external, pass.constructor.name + ' shared' );

			}

		}

	}

	for ( const mode of [ 'SSR', 'Default', 'Depth', 'Normal' ] ) {

		const result = compare( ssr, SSRPass.OUTPUT[ mode ], { depthTexture: ssr.beautyRenderTarget.depthTexture, texture: gBufferPass.normalTexture } );
		comparisons.push( { effect: 'SSRPass', mode: 'Exact beauty depth ' + mode, maxChannelError: result.maxChannelError, meanChannelError: result.meanChannelError, channelsBeyondOne: result.channelsBeyondOne } );

	}

	// Exercise projection changes on the same pass; prepass uses the matching camera.
	const ortho = new OrthographicCamera( - 5, 5, 5, - 5, 0.1, 30 );
	ortho.position.copy( camera.position );
	ortho.lookAt( 0, 0.6, 0 );
	ortho.updateMatrixWorld();
	for ( const pass of [ ssao, ssr ] ) {

		pass.camera = ortho;
		// renderPrepass uses camera, so give it the same projection and view matrices.
		const oldProjection = camera.projectionMatrix.clone();
		const oldInverse = camera.projectionMatrixInverse.clone();
		camera.projectionMatrix.copy( ortho.projectionMatrix );
		camera.projectionMatrixInverse.copy( ortho.projectionMatrixInverse );
		const result = compare( pass, pass.constructor.OUTPUT.Default );
		comparisons.push( { effect: pass.constructor.name, mode: 'Orthographic Default', maxChannelError: result.maxChannelError, meanChannelError: result.meanChannelError, channelsBeyondOne: result.channelsBeyondOne } );
		camera.projectionMatrix.copy( oldProjection );
		camera.projectionMatrixInverse.copy( oldInverse );
		pass.camera = camera;

	}

	ssao.output = SSAOPass.OUTPUT.Default;
	ssr.output = SSRPass.OUTPUT.Default;
	const geometry = () => {

		renderer.setRenderTarget( source );
		renderer.render( scene, camera );

	};

	geometryRenders = 0;
	const render = renderer.render.bind( renderer );
	renderer.render = ( renderedScene, renderedCamera ) => {

		if ( renderedScene === scene ) geometryRenders ++;
		render( renderedScene, renderedCamera );

	};

	const configurations = {};
	const throughput = [];
	if ( parameters.get( 'mode' ) === 'throughput' ) {

		// ABBA counterbalances order and temperature/clock drift.
		const order = parameters.get( 'order' ) === 'shared' ? [ true, false, false, true ] : [ false, true, true, false ];
		for ( const [ index, shared ] of order.entries() ) {

			for ( const pass of [ ssao, ssr ] ) {

				if ( shared ) pass.setGBuffer( gBufferPass.depthTexture, gBufferPass.normalTexture );
				else pass.setGBuffer();

			}

			const frame = () => {

				if ( shared ) renderPrepass();
				ssr.render( renderer, source );
				ssao.render( renderer, output, source );

			};

			document.querySelector( '#status' ).textContent = 'Throughput run ' + ( index + 1 ) + '/4: ' + ( shared ? 'shared' : 'internal' ) + ' (one-second warmup, five-second count)…';
			await countFrames( frame, 1000 );
			renderer.info.reset();
			geometryRenders = 0;
			frame();
			const drawCalls = renderer.info.render.calls;
			const sceneRenders = geometryRenders;
			const fence = gl.fenceSync( gl.SYNC_GPU_COMMANDS_COMPLETE, 0 );
			gl.flush();
			while ( gl.clientWaitSync( fence, 0, 0 ) === gl.TIMEOUT_EXPIRED ) await yieldThroughput();
			gl.deleteSync( fence );
			const measurement = await countFrames( frame, 5000 );
			throughput.push( { implementation: shared ? 'shared' : 'internal', run: index + 1, drawCalls, sceneRenders, ...measurement } );

		}

	} else {

		for ( const shared of parameters.get( 'order' ) === 'shared' ? [ true, false ] : [ false, true ] ) {

			for ( const pass of [ ssao, ssr ] ) {

				if ( shared ) pass.setGBuffer( gBufferPass.depthTexture, gBufferPass.normalTexture );
				else pass.setGBuffer();

			}

			configurations[ shared ? 'ssaoShared' : 'ssaoInternal' ] = await measure( () => {

				geometry();
				if ( shared ) renderPrepass();
				ssao.render( renderer, output, source );

			} );
			configurations[ shared ? 'ssrShared' : 'ssrInternal' ] = await measure( () => {

				if ( shared ) renderPrepass();
				ssr.render( renderer, source );

			} );
			configurations[ shared ? 'combinedShared' : 'combinedInternal' ] = await measure( () => {

				if ( shared ) renderPrepass();
				ssr.render( renderer, source );
				ssao.render( renderer, output, source );

			} );

		}

		configurations.prepass = await measure( renderPrepass );

	}

	const debug = gl.getExtension( 'WEBGL_debug_renderer_info' );
	const result = {
		width, height, ssrDepthBits, sphereSegments: detail, meshes: 25,
		gpu: debug ? gl.getParameter( debug.UNMASKED_RENDERER_WEBGL ) : gl.getParameter( gl.RENDERER ),
		timerAvailable: !! timer, comparisons, configurations, throughput,
		throughputMethod: 'Five-second wall-clock window after one-second warmup; count completed batches using GPU fences, no GPU timer queries or requestAnimationFrame pacing. Up to 24 frames in flight; pending work is drained and excluded from counts.',
		attachmentMemory: {
			note: 'Estimated active attachment bytes per configuration, excludes driver padding and comparison-only resources. DEPTH_COMPONENT24 renderbuffers counted as 4 bytes/pixel. Includes RGBA8 source with depth and RGBA8 output without depth, selected SSR, no bouncing/history allocation.',
			prepassBytes: width * height * 12,
			ssaoInternalBytes: width * height * 40,
			ssaoSharedBytes: width * height * 40,
			ssrInternalBytes: width * height * ( 58 + ( ssrDepthBits === 24 ? 2 : 0 ) ),
			ssrSharedBytes: width * height * ( 58 + ( ssrDepthBits === 24 ? 2 : 0 ) ),
			combinedInternalBytes: width * height * ( 86 + ( ssrDepthBits === 24 ? 2 : 0 ) ),
			combinedSharedBytes: width * height * ( 74 + ( ssrDepthBits === 24 ? 2 : 0 ) )
		}
	};
	document.querySelector( '#status' ).textContent = 'Complete. GPU times are null when timer queries are unavailable; CPU submission time is not GPU time.';
	const table = document.createElement( 'table' );
	const heading = table.insertRow();
	for ( const label of [ 'Configuration', 'Scene renders', 'Draw calls', 'GPU ms', 'CPU submission ms' ] ) {

		const cell = document.createElement( 'th' );
		cell.textContent = label;
		heading.append( cell );

	}

	for ( const [ name, measurement ] of Object.entries( configurations ) ) {

		const row = table.insertRow();
		for ( const value of [ name, measurement.sceneRenders, measurement.drawCalls, measurement.gpuMs?.toFixed( 3 ) ?? 'unavailable', measurement.cpuSubmitMs.toFixed( 3 ) ] ) row.insertCell().textContent = value;

	}

	if ( throughput.length ) {

		table.replaceChildren();
		const header = table.insertRow();
		for ( const label of [ 'Run', 'Implementation', 'Completed frames', 'Seconds', 'Frames/sec', 'Draw calls/frame' ] ) {

			const cell = document.createElement( 'th' );
			cell.textContent = label;
			header.append( cell );

		}

		for ( const measurement of throughput ) {

			const row = table.insertRow();
			for ( const value of [ measurement.run, measurement.implementation, measurement.completedFrames, ( measurement.elapsedMs / 1000 ).toFixed( 3 ), measurement.framesPerSecond.toFixed( 1 ), measurement.drawCalls ] ) row.insertCell().textContent = value;

		}

		document.querySelector( '#status' ).textContent = 'Complete. Five-second completed-frame counts include shared prepass cost and are not paced by the display refresh rate.';

	}

	document.querySelector( '#measurements' ).append( table );
	document.querySelector( '#results' ).textContent = JSON.stringify( result, null, 2 );
	return result;

} )().catch( error => {

	document.querySelector( '#status' ).textContent = error.stack;
	throw error;

} );
