import TempNode from '../core/Node.js';
import ShaderNode from '../shadernode/ShaderNode.js';
import { mul, float } from '../shadernode/ShaderNodeElements.js';

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

	generate( builder ) {

		const type = this.getNodeType( builder );

		const colorNode = this.color || builder.context.color;

		const toneMapping = this.toneMapping;
		const toneMappingParams = { exposure: this.exposureNode, color: colorNode };

		if ( toneMapping === LinearToneMapping ) {

			return LinearToneMappingNode.call( toneMappingParams ).build( builder, type );

		} else {

			return this.colorNode.build( builder, type );

		}

	}

}

export default ToneMappingNode;
