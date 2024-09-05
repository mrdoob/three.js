import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import { vec4, renderOutput } from '../../nodes/TSL.js';
import { LinearSRGBColorSpace, NoToneMapping } from '../../constants.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';

let PostProcessInstance = 0;

class PostProcessing {

	constructor( renderer, outputNode = vec4( 0, 0, 1, 1 ) ) {

		this.renderer = renderer;
		this.outputNode = outputNode;

		this.outputColorTransform = true;

		this.needsUpdate = true;

		this._material = new NodeMaterial();
		this._quadMesh = new QuadMesh();

		this._material.name = `PostProcessing${PostProcessInstance}`;
		PostProcessInstance += 1;

	}

	render() {

		this.update();

		const renderer = this.renderer;

		const toneMapping = renderer.toneMapping;
		const outputColorSpace = renderer.outputColorSpace;

		renderer.toneMapping = NoToneMapping;
		renderer.outputColorSpace = LinearSRGBColorSpace;

		//

		this._quadMesh.render( renderer );

		//

		renderer.toneMapping = toneMapping;
		renderer.outputColorSpace = outputColorSpace;

	}

	update() {

		if ( this.needsUpdate === true ) {

			const renderer = this.renderer;

			const toneMapping = renderer.toneMapping;
			const outputColorSpace = renderer.outputColorSpace;

			this._quadMesh.material = this._material;

			this._quadMesh.material.fragmentNode = this.outputColorTransform === true ? renderOutput( this.outputNode, toneMapping, outputColorSpace ) : this.outputNode.context( { toneMapping, outputColorSpace } );
			this._quadMesh.material.needsUpdate = true;

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

		await this._quadMesh.renderAsync( renderer );

		//

		renderer.toneMapping = toneMapping;
		renderer.outputColorSpace = outputColorSpace;

	}

}

export default PostProcessing;
