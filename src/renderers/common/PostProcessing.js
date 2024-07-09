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

		this.mrt = null;

	}

	setMRT( mrt ) {

		this.mrt = mrt;

		return this;

	}

	getMRT() {

		return this.mrt;

	}

	render() {

		this.update();

		const renderer = this.renderer;

		const toneMapping = renderer.toneMapping;
		const outputColorSpace = renderer.outputColorSpace;
		const currentMRT = renderer.getMRT();

		renderer.toneMapping = NoToneMapping;
		renderer.outputColorSpace = LinearSRGBColorSpace;

		//

		if ( this.mrt !== null ) renderer.setMRT( this.mrt );

		quadMesh.render( renderer );

		//

		renderer.toneMapping = toneMapping;
		renderer.outputColorSpace = outputColorSpace;
		renderer.setMRT( currentMRT );

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
		const currentMRT = renderer.getMRT();

		renderer.toneMapping = NoToneMapping;
		renderer.outputColorSpace = LinearSRGBColorSpace;

		//

		if ( this.mrt !== null ) renderer.setMRT( this.mrt );

		await quadMesh.renderAsync( renderer );

		//

		renderer.toneMapping = toneMapping;
		renderer.outputColorSpace = outputColorSpace;
		renderer.setMRT( currentMRT );

	}

}

export default PostProcessing;
