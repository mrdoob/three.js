import WebGPUNodeBuilder from './WebGPUNodeBuilder.js';
import { NodeFrame } from 'three/nodes';

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

			const scene = objectProperties.scene;
			const lightsNode = objectProperties.lightsNode;

			nodeBuilder = new WebGPUNodeBuilder( object, this.renderer );
			nodeBuilder.lightsNode = lightsNode;
			nodeBuilder.fogNode = scene ? scene.fogNode : undefined;
			nodeBuilder.scene = scene;
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
