import { vec4, MeshBasicNodeMaterial } from '../../nodes/Nodes.js';
import QuadMesh from '../../objects/QuadMesh.js';

const quadMesh = new QuadMesh( new MeshBasicNodeMaterial() );

class PostProcessing {

	constructor( renderer, outputNode = vec4( 0, 0, 1, 1 ) ) {

		this.renderer = renderer;
		this.outputNode = outputNode;

	}

	render() {

		quadMesh.material.fragmentNode = this.outputNode;

		quadMesh.render( this.renderer );

	}

}

export default PostProcessing;
