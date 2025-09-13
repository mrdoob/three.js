
import { InspectorBase, TimestampQuery } from 'three/webgpu';

class ObjectStats {

	constructor( uid, name ) {

		this.uid = uid;
		this.cid = uid.match( /^(.*):f(\d+)$/ )[ 1 ]; // call id
		this.name = name;
		this.timestamp = 0;
		this.cpu = 0;
		this.gpu = 0;

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

		this.frames = [];
		this.framesLib = {};
		this.maxFrames = 512;

		this._lastFinishTime = 0;
		this._resolveTimestampPromise = null;

		this.isRendererInspector = true;

	}

	begin() {

		this.currentFrame = this._createFrame();
		this.currentRender = this.currentFrame;

	}

	finish() {

		const now = performance.now();

		const frame = this.currentFrame;
		frame.finishTime = now;
		frame.deltaTime = now - ( this._lastFinishTime > 0 ? this._lastFinishTime : now );

		this.addFrame( frame );

		this.currentFrame = null;
		this.currentRender = null;

		this._lastFinishTime = now;

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

		return this.currentFrame;

	}

	getFrameById( frameId ) {

		return this.framesLib[ frameId ] || null;

	}

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

										stats.gpu = renderer.backend.getTimestamp( stats.uid );

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

										stats.gpu = renderer.backend.getTimestamp( stats.uid );

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

	addFrame( frame ) {

		// Limit to max frames.

		if ( this.frames.length >= this.maxFrames ) {

			const removedFrame = this.frames.shift();
			delete this.framesLib[ removedFrame.frameId ];

		}

		this.frames.push( frame );
		this.framesLib[ frame.frameId ] = frame;

		this.resolveTimestamp();

	}

	beginCompute( uid, computeNode ) {

		const frame = this.getFrame();

		if ( ! frame ) return;

		const currentCompute = new ComputeStats( uid, computeNode );
		currentCompute.timestamp = performance.now();
		currentCompute.parent = this.currentRender;

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

		this.currentCompute = null;

	}

	beginRender( uid, scene, camera, renderTarget ) {

		const frame = this.getFrame();

		const currentRender = new RenderStats( uid, scene, camera, renderTarget );
		currentRender.timestamp = performance.now();
		currentRender.parent = this.currentRender;

		frame.renders.push( currentRender );

		if ( this.currentRender !== null ) {

			this.currentRender.children.push( currentRender );

		} else {

			frame.children.push( currentRender );

		}

		this.currentRender = currentRender;

	}

	finishRender() {

		const currentRender = this.currentRender;
		currentRender.cpu = performance.now() - currentRender.timestamp;

		this.currentRender = currentRender.parent;

	}

}
