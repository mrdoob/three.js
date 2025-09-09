
import { InspectorBase, TimestampQuery } from 'three/webgpu';

class ObjectStats {

	constructor( uid, name ) {

		this.uid = uid;
		this.name = name;
		this.timestamp = 0;
		this.cpu = 0;
		this.gpu = 0;

		this.children = [];
		this.parent = null;

	}

	get total() {

		return this.cpu + this.gpu;

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

		this.isRendererInspector = true;

	}

	getFrame() {

		const frameId = this.nodeFrame.frameId;

		if ( this.currentFrame && this.currentFrame.frameId === frameId ) return this.currentFrame;

		if ( this.currentFrame !== null ) {

			this.resolveFrame( this.currentFrame );

		}

		this.currentFrame = {
			frameId: frameId,
			children: []
		};

		this.currentRender = this.currentFrame;

		return this.currentFrame;

	}

	updateStats( stats ) {

		const renderer = this.getRenderer();

		stats.gpu = renderer.backend.timestampQueryPool.render.getCurrentTimestamp( stats.uid ) || 0;

		for ( const child of stats.children ) {

			this.updateStats( child );

			stats.cpu += child.cpu;
			stats.gpu += child.gpu;

		}

	}

	async resolveFrame( frame ) {

		const renderer = this.getRenderer();

		await renderer.resolveTimestampsAsync( TimestampQuery.COMPUTE );
		await renderer.resolveTimestampsAsync( TimestampQuery.RENDER );

		frame.cpu = 0;
		frame.gpu = 0;
		frame.total = 0;

		for ( const stats of frame.children ) {

			this.updateStats( stats );

			frame.cpu += stats.cpu;
			frame.gpu += stats.gpu;
			frame.total += stats.total;

		}

	}

	beginCompute( uid, computeNode ) {

		const frame = this.getFrame();

		const currentCompute = new ComputeStats( uid, computeNode );
		currentCompute.timestamp = performance.now();
		currentCompute.parent = this.currentRender;

		if ( this.currentRender !== null ) {

			this.currentRender.children.push( currentCompute );

		} else {

			frame.children.push( currentCompute );

		}

		this.currentCompute = currentCompute;

	}

	finishCompute() {

		const currentCompute = this.currentCompute;
		currentCompute.cpu = performance.now() - currentCompute.timestamp;

		this.currentCompute = null;

	}

	beginRender( uid, scene, camera, renderTarget ) {

		const frame = this.getFrame();

		const currentRender = new RenderStats( uid, scene, camera, renderTarget );
		currentRender.timestamp = performance.now();
		currentRender.parent = this.currentRender;

		if ( this.currentRender !== null ) {

			this.currentRender.children.push( currentRender );

		} else {

			frame.children.push( currentRender );

		}

		this.currentRender = currentRender;

	}

	finishRender( uid ) {

		const frame = this.getFrame();

		const currentRender = this.currentRender;
		currentRender.cpu = performance.now() - currentRender.timestamp;

		this.currentRender = currentRender.parent;

	}

}
