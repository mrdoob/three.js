import WebGPUNodeBuilder from './WebGPUNodeBuilder.js';
import NodeFrame from 'three-nodes/core/NodeFrame.js';

class WebGPUNodes {

	constructor( renderer, properties ) {

		this.renderer = renderer;
		this.properties = properties;

		this.nodeFrame = new NodeFrame();

	}

	get( object ) {

		const objectProperties = this.properties.get( object );

		let nodeBuilder = objectProperties.nodeBuilder;

		if ( nodeBuilder === undefined ) {

			const fogNode = objectProperties.fogNode;
			const lightNode = objectProperties.lightNode;

			nodeBuilder = new WebGPUNodeBuilder( object, this.renderer );
			nodeBuilder.lightNode = lightNode;
			nodeBuilder.fogNode = fogNode;
			nodeBuilder.build();

			objectProperties.nodeBuilder = nodeBuilder;

		}

		return nodeBuilder;

	}

	remove( object ) {

		const objectProperties = this.properties.get( object );

		delete objectProperties.nodeBuilder;

	}

	updateFrame() {

		this.nodeFrame.update();

	}

	update( object, camera ) {

		const renderer = this.renderer;
		const material = object.material;

		const nodeBuilder = this.get( object );
		const nodeFrame = this.nodeFrame;

		nodeFrame.object = object;
		nodeFrame.camera = camera;
		nodeFrame.renderer = renderer;
		nodeFrame.material = material;

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	dispose() {

		this.nodeFrame = new NodeFrame();

	}

}

export default WebGPUNodes;
