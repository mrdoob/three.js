import WebGPUNodeBuilder from './WebGPUNodeBuilder.js';
import NodeFrame from '../../nodes/core/NodeFrame.js';

class WebGPUNodes {

	constructor( renderer ) {

		this.renderer = renderer;

		this.nodeFrame = new NodeFrame();

		this.builders = new WeakMap();

	}

	get( object ) {

		let nodeBuilder = this.builders.get( object );

		if ( nodeBuilder === undefined ) {

			nodeBuilder = new WebGPUNodeBuilder( object.material, this.renderer ).build();

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

	update( object, camera ) {

		const material = object.material;

		const nodeBuilder = this.get( object );
		const nodeFrame = this.nodeFrame;

		nodeFrame.material = material;
		nodeFrame.camera = camera;
		nodeFrame.object = object;

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	dispose() {

		this.builders = new WeakMap();

	}

}

export default WebGPUNodes;
