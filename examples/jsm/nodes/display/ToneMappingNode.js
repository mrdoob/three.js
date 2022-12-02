import TempNode from '../core/Node.js';
import { ShaderNode, mul, float } from '../shadernode/ShaderNodeBaseElements.js';

import { LinearToneMapping } from 'three';

// exposure only
export const LinearToneMappingNode = new ShaderNode( ( { color, exposure } ) => {

	return mul( color, exposure );

} );

class ToneMappingNode extends TempNode {

	constructor( toneMapping, exposureNode = float( 1 ), colorNode = null ) {

		super( 'vec3' );

		this.toneMapping = toneMapping;

		this.exposureNode = exposureNode;
		this.colorNode = colorNode;

	}

	construct( builder ) {

		const colorNode = this.color || builder.context.color;

		const toneMapping = this.toneMapping;
		const toneMappingParams = { exposure: this.exposureNode, color: colorNode };

		let outputNode = null;

		if ( toneMapping === LinearToneMapping ) {

			outputNode = LinearToneMappingNode.call( toneMappingParams );

		} else {

			outputNode = this.colorNode;

		}

		return outputNode;

	}

}

export default ToneMappingNode;
