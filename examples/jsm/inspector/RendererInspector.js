
import { InspectorBase, TimestampQuery } from 'three/webgpu';

class ObjectStats {

	constructor( uid, name ) {

		this.uid = uid;
		this.cid = uid.match( /^(.*):f(\d+)$/ )[ 1 ]; // call id
		this.name = name;
		this.timestamp = 0;
		this.cpu = 0;
		this.gpu = 0;
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

		super( uid, computeNode.name );

		this.computeNode = computeNode;

		this.isComputeStats = true;

	}

}

export class RendererInspector extends InspectorBase {

	constructor() {

		super();

		this.currentFrame = null;
		this.currentRender = null;
		this.currentNodes = null;
		this.lastFrame = null;

		this.frames = [];
		this.framesLib = {};
		this.maxFrames = 512;

		this._lastFinishTime = 0;
		this._resolveTimestampPromise = null;

		this.isRendererInspector = true;

	}

	getParent() {

		return this.currentRender || this.getFrame();

	}

	begin() {

		this.currentFrame = this._createFrame();
		this.currentRender = this.currentFrame;
		this.currentNodes = [];

	}

	finish() {

		const now = performance.now();

		const frame = this.currentFrame;
		frame.finishTime = now;
		frame.deltaTime = now - ( this._lastFinishTime > 0 ? this._lastFinishTime : now );

		this.addFrame( frame );

		this.fps = this._getFPS();

		this.lastFrame = frame;

		this.currentFrame = null;
		this.currentRender = null;
		this.currentNodes = null;

		this._lastFinishTime = now;

	}

	_getFPS() {

		let frameSum = 0;
		let timeSum = 0;

		for ( let i = this.frames.length - 1; i >= 0; i -- ) {

			const frame = this.frames[ i ];

			frameSum ++;
			timeSum += frame.deltaTime;

			if ( timeSum >= 1000 ) break;

		}

		return ( frameSum * 1000 ) / timeSum;

	}

	_createFrame() {

		return {
			frameId: this.nodeFrame.frameId,
			resolvedCompute: false,
			resolvedRender: false,
			deltaTime: 0,
			startTime: performance.now(),
			finishTime: 0,
			miscellaneous: 0,
			children: [],
			renders: [],
			computes: []
		};

	}

	getFrame() {

		return this.currentFrame || this.lastFrame;

	}

	getFrameById( frameId ) {

		return this.framesLib[ frameId ] || null;

	}

	resolveViewer() { }

	resolveFrame( /*frame*/ ) { }

	async resolveTimestamp() {

		if ( this._resolveTimestampPromise !== null ) {

			return this._resolveTimestampPromise;

		}

		this._resolveTimestampPromise = new Promise( ( resolve ) => {

			requestAnimationFrame( async () => {

				const renderer = this.getRenderer();

				await renderer.resolveTimestampsAsync( TimestampQuery.COMPUTE );
				await renderer.resolveTimestampsAsync( TimestampQuery.RENDER );

				const computeFrames = renderer.backend.getTimestampFrames( TimestampQuery.COMPUTE );
				const renderFrames = renderer.backend.getTimestampFrames( TimestampQuery.RENDER );

				const frameIds = [ ...new Set( [ ...computeFrames, ...renderFrames ] ) ];

				for ( const frameId of frameIds ) {

					const frame = this.getFrameById( frameId );

					if ( frame !== null ) {

						// resolve compute timestamps

						if ( frame.resolvedCompute === false ) {

							if ( frame.computes.length > 0 ) {

								if ( computeFrames.includes( frameId ) ) {

									for ( const stats of frame.computes ) {

										if ( renderer.backend.hasTimestamp( stats.uid ) ) {

											stats.gpu = renderer.backend.getTimestamp( stats.uid );

										} else {

											stats.gpu = 0;
											stats.gpuNotAvailable = true;

										}

									}

									frame.resolvedCompute = true;

								}

							} else {

								frame.resolvedCompute = true;

							}

						}

						// resolve render timestamps

						if ( frame.resolvedRender === false ) {

							if ( frame.renders.length > 0 ) {

								if ( renderFrames.includes( frameId ) ) {

									for ( const stats of frame.renders ) {

										if ( renderer.backend.hasTimestamp( stats.uid ) ) {

											stats.gpu = renderer.backend.getTimestamp( stats.uid );

										} else {

											stats.gpu = 0;
											stats.gpuNotAvailable = true;

										}

									}

									frame.resolvedRender = true;

								}

							} else {

								frame.resolvedRender = true;

							}

						}

						if ( frame.resolvedCompute === true && frame.resolvedRender === true ) {

							this.resolveFrame( frame );

						}

					}

				}

				this._resolveTimestampPromise = null;

				resolve();

			} );

		} );

		return this._resolveTimestampPromise;

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

		if ( this.isAvailable ) {

			this.resolveViewer();
			this.resolveTimestamp();

		}

	}

	inspect( node ) {

		this.currentNodes.push( node );

	}

	beginCompute( uid, computeNode ) {

		const frame = this.getFrame();

		if ( ! frame ) return;

		const currentCompute = new ComputeStats( uid, computeNode );
		currentCompute.timestamp = performance.now();
		currentCompute.parent = this.currentCompute || this.getParent();

		frame.computes.push( currentCompute );

		if ( this.currentRender !== null ) {

			this.currentRender.children.push( currentCompute );

		} else {

			frame.children.push( currentCompute );

		}

		this.currentCompute = currentCompute;

	}

	finishCompute() {

		const frame = this.getFrame();

		if ( ! frame ) return;

		const currentCompute = this.currentCompute;
		currentCompute.cpu = performance.now() - currentCompute.timestamp;

		this.currentCompute = currentCompute.parent.isComputeStats ? currentCompute.parent : null;

	}

	beginRender( uid, scene, camera, renderTarget ) {

		const frame = this.getFrame();

		if ( ! frame ) return;

		const currentRender = new RenderStats( uid, scene, camera, renderTarget );
		currentRender.timestamp = performance.now();
		currentRender.parent = this.getParent();

		frame.renders.push( currentRender );

		if ( this.currentRender !== null ) {

			this.currentRender.children.push( currentRender );

		} else {

			frame.children.push( currentRender );

		}

		this.currentRender = currentRender;

	}

	finishRender() {

		const frame = this.getFrame();

		if ( ! frame ) return;

		const currentRender = this.currentRender;
		currentRender.cpu = performance.now() - currentRender.timestamp;

		this.currentRender = currentRender.parent;

	}

}
