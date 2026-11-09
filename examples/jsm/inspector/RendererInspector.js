
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
		this.gpuNotAvailable = false;
		this.fps = 0;

		this.children = [];
		this.parent = null;

	}

}

class RenderStats extends ObjectStats {

	constructor( uid, scene, camera, renderTarget ) {

		let name = scene.name;

		if ( name === '' ) {

			if ( scene.isScene ) {

				name = 'Scene';

			} else if ( scene.isQuadMesh ) {

				name = 'QuadMesh';

			}

		}

		super( uid, name );

		this.scene = scene;
		this.camera = camera;
		this.renderTarget = renderTarget;

		this.isRenderStats = true;

	}

}

class ComputeStats extends ObjectStats {

	constructor( uid, computeNode ) {

		const name = computeNode.name || ( computeNode.isComputeNode ? 'Compute' : 'Compute Group' );

		super( uid, name );

		this.computeNode = computeNode;

		this.isComputeStats = true;

	}

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

				stats.gpu = gpu;

			}

			frame.pendingTimers --;

			this._resolveFrameIfComplete( frame );

		} );

	}

	_resolveFrameIfComplete( frame ) {

		if ( frame.finished === true && frame.pendingTimers === 0 && this.framesLib[ frame.frameId ] === frame ) {

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

		const currentRender = new RenderStats( uid, scene, camera, renderTarget );
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

	}

}
