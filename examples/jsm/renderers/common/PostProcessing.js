import { vec4, NodeMaterial } from '../../nodes/Nodes.js';
import QuadMesh from '../../objects/QuadMesh.js';

const quadMesh = new QuadMesh( new NodeMaterial() );

class PostProcessing {

	constructor( renderer, outputNode = vec4( 0, 0, 1, 1 ) ) {

		this.renderer = renderer;
		this.outputNode = outputNode;

	}

	render() {

		quadMesh.material.fragmentNode = this.outputNode;

		quadMesh.render( this.renderer );

	}

	renderAsync() {

		quadMesh.material.fragmentNode = this.outputNode;

		return quadMesh.renderAsync( this.renderer );

	}

	set needsUpdate( value ) {

		quadMesh.material.needsUpdate = value;

	}

}

export default PostProcessing;
