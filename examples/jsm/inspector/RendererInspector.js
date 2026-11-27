
import { InspectorBase, GPUTimer, warnOnce, RendererUtils, MeshBasicNodeMaterial, AdditiveBlending, NoToneMapping, LinearSRGBColorSpace } from 'three/webgpu';
import { vec3 } from 'three/tsl';

class ObjectStats {

	constructor( uid, name ) {

		this.uid = uid;
		this.cid = uid.match( /^(.*):f(\d+)$/ )[ 1 ]; // call id
		this.name = name;
		this.timestamp = 0;
		this.timer = null;
		this.cpu = 0;
		this.gpu = 0;
		this.gpuStart = null; // GPU timestamps, only comparable with each other and null in WebGL
		this.gpuEnd = null;
		this.cpuOffset = - 1; // time since the start of the frame, negative if not available
		this.gpuOffset = - 1;
		this.gpuNotAvailable = false;
		this.fps = 0;

		this.children = [];
		this.parent = null;

	}

}

function getRenderName( scene, camera, renderTarget, activeCubeFace, activeMipmapLevel ) {

	// Keep the material's name intact for shader program labels.
	const materialLabel = scene.material?.name?.replaceAll( ': ', ' / ' );

	if ( renderTarget?.isCubeRenderTarget ) {

		const label = scene.name || materialLabel || renderTarget.texture.name || 'Cube Capture';

		return `${ label } / Mip ${ activeMipmapLevel } / Face ${ activeCubeFace }`;

	}

	return scene.name || materialLabel || camera.name || ( scene.isQuadMesh ? 'Quad Mesh' : scene.type );

}

function getComputeName( computeNode ) {

	return computeNode.name || ( computeNode.isComputeNode ? 'Compute' : 'Compute Group' );

}

class RenderStats extends ObjectStats {

	constructor( uid, scene, camera, renderTarget, renderer ) {

		super( uid, getRenderName( scene, camera, renderTarget, renderer.getActiveCubeFace(), renderer.getActiveMipmapLevel() ) );

		this.scene = scene;
		this.camera = camera;
		this.renderTarget = renderTarget;

		this.isRenderStats = true;

	}

}

class ComputeStats extends ObjectStats {

	constructor( uid, computeNode ) {

		super( uid, getComputeName( computeNode ) );

		this.computeNode = computeNode;

		this.isComputeStats = true;

	}

}

// consecutive calls of the same group, e.g. the passes of an effect

class GroupStats extends ObjectStats {

	constructor( uid, name, parent, calls ) {

		super( uid, name );

		const first = calls[ 0 ];
		const last = calls[ calls.length - 1 ];
		const timed = calls.filter( ( stats ) => stats.gpuStart !== null );

		this.parent = parent;
		this.children = calls;

		this.timestamp = first.timestamp;
		this.cpu = last.timestamp + last.cpu - first.timestamp;
		this.cpuOffset = first.cpuOffset;

		this.gpu = getSpanTime( calls );
		this.gpuNotAvailable = calls.every( ( stats ) => stats.gpuNotAvailable );

		if ( timed.length > 0 ) {

			this.gpuStart = Math.min( ...timed.map( ( stats ) => stats.gpuStart ) );
			this.gpuEnd = Math.max( ...timed.map( ( stats ) => stats.gpuEnd ) );
			this.gpuOffset = Math.min( ...timed.map( ( stats ) => stats.gpuOffset ) );

		}

		this.isGroupStats = true;

	}

}

// returns the union of the measured call spans, or the sum of their times without timestamps

function getSpanTime( children ) {

	const spans = children.filter( ( stats ) => stats.gpuStart !== null ).sort( ( a, b ) => a.gpuStart - b.gpuStart );

	if ( spans.length === 0 ) return children.reduce( ( sum, stats ) => sum + stats.gpu, 0 );

	let duration = 0;
	let end = - Infinity;

	for ( const { gpuStart, gpuEnd } of spans ) {

		if ( gpuEnd > end ) {

			duration += gpuEnd - Math.max( gpuStart, end );
			end = gpuEnd;

		}

	}

	return duration;

}

// tile-based GPUs can run the vertex stage of a call while the previous ones are still shading, so its time
// includes the wait. Each call starts after the end of the previous ones, and the sum is the union of the spans

function sequenceCalls( children, end = - Infinity ) {

	const calls = children.filter( ( stats ) => stats.gpuStart !== null ).sort( ( a, b ) => a.gpuStart - b.gpuStart );

	for ( const stats of calls ) {

		stats.gpuStart = Math.max( stats.gpuStart, end );
		stats.gpuEnd = Math.max( stats.gpuEnd, stats.gpuStart );
		stats.gpu = stats.gpuEnd - stats.gpuStart;

		sequenceCalls( stats.children, stats.gpuStart );

		end = stats.gpuEnd;

	}

}

// stores the offsets of the calls in the frame, the CPU and GPU clocks have separate origins

function resolveOffsets( frame ) {

	const calls = [ ...frame.renders, ...frame.computes ];
	const gpuStart = calls.reduce( ( start, stats ) => stats.gpuStart !== null ? Math.min( start, stats.gpuStart ) : start, Infinity );

	for ( const stats of calls ) {

		stats.cpuOffset = stats.timestamp - frame.startTime;

		if ( stats.gpuStart !== null ) stats.gpuOffset = stats.gpuStart - gpuStart;

	}

}

// splits the first level of names like "Group / Stage / Pass"

function parseName( name ) {

	const match = /^\s*([^/]*?[^/\s])\s*\/\s*(\S.*?)\s*$/s.exec( name );

	return match !== null ? { group: match[ 1 ], pass: match[ 2 ] } : { group: null, pass: name };

}

// moves the consecutive calls of the same group under a GroupStats, even a single one

function groupCalls( parent, frameId ) {

	const runs = [];

	for ( const stats of parent.children ) {

		const { group, pass } = stats.isGroupStats ? { group: null, pass: stats.name } : parseName( stats.name );
		const run = runs[ runs.length - 1 ];

		if ( group !== null && run !== undefined && run.group === group ) {

			run.calls.push( stats );
			run.passes.push( pass );

		} else {

			const index = runs.filter( ( run ) => run.group === group ).length;

			runs.push( { group, index, calls: [ stats ], passes: [ pass ] } );

		}

	}

	parent.children = runs.map( ( { group, index, calls, passes } ) => {

		if ( group === null ) {

			groupCalls( calls[ 0 ], frameId );
			return calls[ 0 ];

		}

		const groupStats = new GroupStats( `${ parent.cid || '' }/${ group }/${ index }:f${ frameId }`, group, parent, calls );

		calls.forEach( ( stats, i ) => {

			stats.name = passes[ i ];
			stats.parent = groupStats;

		} );

		groupCalls( groupStats, frameId );

		return groupStats;

	} );

}

// returns true if the frame of the animation loop rendered or computed

function isRenderedFrame( frame ) {

	return frame.renders.length > 0 || frame.computes.length > 0;

}

export class RendererInspector extends InspectorBase {

	constructor() {

		super();

		this.currentFrame = null;
		this.currentContext = null;
		this.currentRender = null;
		this.currentCompute = null;
		this.currentNodes = null;
		this.lastFrame = null;

		this.frames = [];
		this.framesLib = {};
		this.maxFrames = 512;

		this._callNames = new WeakMap();

		this._lastFinishTime = 0;
		this._lastRenderedFinishTime = 0;

		this.overdraw = false;
		this._overdrawMaterial = null;
		this._renderingOverdraw = false;

		this.isRendererInspector = true;

	}

	getParent() {

		return this.currentContext || this.getFrame();

	}

	begin() {

		super.begin();

		this.currentFrame = this._createFrame();
		this.currentContext = this.currentFrame;
		this.currentRender = null;
		this.currentCompute = null;
		this.currentNodes = [];

	}

	finish() {

		super.finish();

		const now = performance.now();

		const frame = this.currentFrame;
		frame.finishTime = now;

		// frames of the animation loop which didn't render or compute, like frames skipped by the application
		// while the GPU is busy, are not frames of the application: the time is measured since the last frame
		// which rendered

		if ( isRenderedFrame( frame ) ) {

			frame.deltaTime = now - ( this._lastRenderedFinishTime > 0 ? this._lastRenderedFinishTime : now );

			this._lastRenderedFinishTime = now;

		} else {

			frame.deltaTime = now - ( this._lastFinishTime > 0 ? this._lastFinishTime : now );

		}

		this.addFrame( frame );

		this.fps = this._getFPS();

		this.lastFrame = frame;

		this.currentFrame = null;
		this.currentContext = null;
		this.currentRender = null;
		this.currentCompute = null;
		this.currentNodes = null;

		this._lastFinishTime = now;

	}

	_renderOverdraw() {

		const primaryPass = this.getPrimaryPass();

		if ( primaryPass === null ) return;

		const renderer = this.getRenderer();

		if ( this._overdrawMaterial === null ) {

			// additive constant, so each pixel sums the depth-passing fragments it shaded

			this._overdrawMaterial = new MeshBasicNodeMaterial( {
				colorNode: vec3( 0.25 ),
				blending: AdditiveBlending,
				depthTest: true,
				depthWrite: true
			} );

		}

		const { scene, camera } = primaryPass;

		// raw render against black with no tone mapping, so the count stays linear

		const state = RendererUtils.resetRendererAndSceneState( renderer, scene );

		renderer.toneMapping = NoToneMapping;
		renderer.outputColorSpace = LinearSRGBColorSpace;

		scene.overrideMaterial = this._overdrawMaterial;

		this._renderingOverdraw = true;

		renderer.render( scene, camera );

		this._renderingOverdraw = false;

		RendererUtils.restoreRendererAndSceneState( renderer, scene, state );

	}

	_getFPS() {

		// only the frames which rendered or computed are counted, within the last second

		let frameSum = 0;
		let timeSum = 0;

		for ( let i = this.frames.length - 1; i >= 0; i -- ) {

			const frame = this.frames[ i ];

			if ( isRenderedFrame( frame ) === false ) continue;

			frameSum ++;
			timeSum += frame.deltaTime;

			if ( timeSum >= 1000 ) break;

		}

		return timeSum > 0 ? ( frameSum * 1000 ) / timeSum : 0;

	}

	_createFrame() {

		return {
			frameId: this.nodeFrame.frameId,
			finished: false,
			pendingTimers: 0,
			deltaTime: 0,
			startTime: performance.now(),
			finishTime: 0,
			miscellaneous: 0,
			children: [],
			renders: [],
			computes: []
		};

	}

	getPrimaryPass() {

		const frame = this.getFrame();

		// first scene render of the frame; nested shadow / RTT passes come after

		let primary = null;

		for ( const render of frame.renders ) {

			if ( render.scene.isScene === true ) {

				primary = render;
				break;

			}

		}

		return primary;

	}

	getFrame() {

		return this.currentFrame || this.lastFrame;

	}

	getFrameById( frameId ) {

		return this.framesLib[ frameId ] || null;

	}

	updateTabs() { }

	resolveFrame( /*frame*/ ) { }

	// each render and compute call is timed by its own GPU timer. The frame is resolved once it has
	// finished and all its timers have been read

	_beginTimer( stats ) {

		stats.timer = new GPUTimer( this.getRenderer() );
		stats.timer.begin();

	}

	_endTimer( frame, stats ) {

		frame.pendingTimers ++;

		stats.timer.end().then( ( gpu ) => {

			if ( gpu === null ) {

				stats.gpuNotAvailable = true;

			} else {

				stats.gpu = gpu.delta;
				stats.gpuStart = gpu.start;
				stats.gpuEnd = gpu.end;

			}

			frame.pendingTimers --;

			this._resolveFrameIfComplete( frame );

		} );

	}

	_resolveFrameIfComplete( frame ) {

		if ( frame.finished === true && frame.pendingTimers === 0 && this.framesLib[ frame.frameId ] === frame ) {

			frame.gpuSpanTime = getSpanTime( frame.children );

			sequenceCalls( frame.children );
			resolveOffsets( frame );
			groupCalls( frame, frame.frameId );

			this.resolveFrame( frame );

		}

	}

	get isAvailable() {

		const renderer = this.getRenderer();

		return renderer !== null;

	}

	addFrame( frame ) {

		// Limit to max frames.

		if ( this.frames.length >= this.maxFrames ) {

			const removedFrame = this.frames.shift();
			delete this.framesLib[ removedFrame.frameId ];

		}

		this.frames.push( frame );
		this.framesLib[ frame.frameId ] = frame;

		frame.finished = true;

		if ( this.isAvailable ) {

			this.updateTabs();
			this._resolveFrameIfComplete( frame );

		}

	}

	inspect( node ) {

		if ( this.enabled === false ) return;

		const currentNodes = this.currentNodes;

		if ( currentNodes !== null ) {

			currentNodes.push( node );

		} else {

			warnOnce( 'RendererInspector: Unable to inspect node outside of frame scope. Use "renderer.setAnimationLoop()".' );

		}

	}

	// returns the path of names of the render and compute calls which created a resource, see Info.resources

	getCreatorPath( creator ) {

		return creator.flatMap( ( call ) => {

			let names = this._callNames.get( call );

			if ( names === undefined ) {

				const name = call.computeNode ? getComputeName( call.computeNode ) : getRenderName( call.scene, call.camera, call.renderTarget, call.activeCubeFace, call.activeMipmapLevel );

				names = name.trim().split( /\s*\/\s*/ );

				this._callNames.set( call, names );

			}

			return names;

		} );

	}

	beginCompute( uid, computeNode ) {

		const frame = this.getFrame();

		if ( ! frame ) return;

		const currentCompute = new ComputeStats( uid, computeNode );
		currentCompute.timestamp = performance.now();
		currentCompute.parent = this.getParent();

		frame.computes.push( currentCompute );
		currentCompute.parent.children.push( currentCompute );

		this.currentCompute = currentCompute;
		this.currentContext = currentCompute;

		this._beginTimer( currentCompute );

	}

	finishCompute() {

		const frame = this.getFrame();

		if ( ! frame ) return;

		const currentCompute = this.currentCompute;
		currentCompute.cpu = performance.now() - currentCompute.timestamp;

		this._endTimer( frame, currentCompute );

		this.currentContext = currentCompute.parent;
		this.currentCompute = currentCompute.parent && currentCompute.parent.isComputeStats ? currentCompute.parent : null;

	}

	beginRender( uid, scene, camera, renderTarget ) {

		const frame = this.getFrame();

		if ( ! frame ) return;

		const currentRender = new RenderStats( uid, scene, camera, renderTarget, this.getRenderer() );
		currentRender.timestamp = performance.now();
		currentRender.parent = this.getParent();

		frame.renders.push( currentRender );
		currentRender.parent.children.push( currentRender );

		this.currentRender = currentRender;
		this.currentContext = currentRender;

		this._beginTimer( currentRender );

	}

	finishRender() {

		const frame = this.getFrame();

		if ( ! frame ) return;

		const currentRender = this.currentRender;
		currentRender.cpu = performance.now() - currentRender.timestamp;

		this._endTimer( frame, currentRender );

		this.currentContext = currentRender.parent;
		this.currentRender = currentRender.parent && currentRender.parent.isRenderStats ? currentRender.parent : null;

		// draw over each top-level render to the canvas, the frame finishes only at the start of the next one

		if ( this.overdraw === true && this._renderingOverdraw === false && currentRender.parent === frame && this.getRenderer().getRenderTarget() === null ) {

			this._renderOverdraw();

		}

	}

	dispose() {

		if ( this._overdrawMaterial !== null ) {

			this._overdrawMaterial.dispose();
			this._overdrawMaterial = null;

		}

		super.dispose();

		this.frames = [];
		this.framesLib = {};

	}

}
