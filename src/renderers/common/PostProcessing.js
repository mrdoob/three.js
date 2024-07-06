import { vec4, renderOutput, NodeMaterial } from '../../nodes/Nodes.js';
import { LinearSRGBColorSpace, NoToneMapping } from '../../constants.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';

const quadMesh = new QuadMesh( new NodeMaterial() );

class PostProcessing {

	constructor( renderer, outputNode = vec4( 0, 0, 1, 1 ) ) {

		this.renderer = renderer;
		this.outputNode = outputNode;

		this.outputColorTransform = true;

		this.needsUpdate = true;

	}

	render() {

		this.update();

		const renderer = this.renderer;

		const toneMapping = renderer.toneMapping;
		const outputColorSpace = renderer.outputColorSpace;

		renderer.toneMapping = NoToneMapping;
		renderer.outputColorSpace = LinearSRGBColorSpace;

		//

		quadMesh.render( this.renderer );

		//

		renderer.toneMapping = toneMapping;
		renderer.outputColorSpace = outputColorSpace;

	}

	update() {

		if ( this.needsUpdate === true ) {

			const renderer = this.renderer;

			const toneMapping = renderer.toneMapping;
			const outputColorSpace = renderer.outputColorSpace;

			quadMesh.material.fragmentNode = this.outputColorTransform === true ? renderOutput( this.outputNode, toneMapping, outputColorSpace ) : this.outputNode.context( { toneMapping, outputColorSpace } );
			quadMesh.material.needsUpdate = true;

			this.needsUpdate = false;

		}

	}

	async renderAsync() {

		this.update();

		const renderer = this.renderer;

		const toneMapping = renderer.toneMapping;
		const outputColorSpace = renderer.outputColorSpace;

		renderer.toneMapping = NoToneMapping;
		renderer.outputColorSpace = LinearSRGBColorSpace;

		//

		await quadMesh.renderAsync( this.renderer );

		//

		renderer.toneMapping = toneMapping;
		renderer.outputColorSpace = outputColorSpace;

	}

}

export default PostProcessing;
