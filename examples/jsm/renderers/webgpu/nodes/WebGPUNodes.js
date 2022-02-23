import WebGPUNodeBuilder from './WebGPUNodeBuilder.js';
import NodeFrame from 'three-nodes/core/NodeFrame.js';

class WebGPUNodes {

	constructor( renderer ) {

		this.renderer = renderer;

		this.nodeFrame = new NodeFrame();

		this.builders = new WeakMap();

	}

	get( object, lightNode ) {

		let nodeBuilder = this.builders.get( object );

		if ( nodeBuilder === undefined ) {

			nodeBuilder = new WebGPUNodeBuilder( object, this.renderer, lightNode ).build();

			this.builders.set( object, nodeBuilder );

		}

		return nodeBuilder;

	}

	remove( object ) {

		this.builders.delete( object );

	}

	updateFrame() {

		this.nodeFrame.update();

	}

	update( object, camera, lightNode ) {

		const renderer = this.renderer;
		const material = object.material;

		const nodeBuilder = this.get( object, lightNode );
		const nodeFrame = this.nodeFrame;

		nodeFrame.material = material;
		nodeFrame.camera = camera;
		nodeFrame.object = object;
		nodeFrame.renderer = renderer;

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	dispose() {

		this.builders = new WeakMap();

	}

}

export default WebGPUNodes;
