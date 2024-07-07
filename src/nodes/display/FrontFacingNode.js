import Node, { addNodeClass } from '../core/Node.js';
import { nodeImmutable, float } from '../shadernode/ShaderNode.js';

import { BackSide, WebGLCoordinateSystem } from '../../constants.js';

class FrontFacingNode extends Node {

	constructor() {

		super( 'bool' );

		this.isFrontFacingNode = true;

	}

	generate( builder ) {

		const { renderer, material } = builder;

		if ( renderer.coordinateSystem === WebGLCoordinateSystem ) {

			if ( material.side === BackSide ) {

				return 'false';

			}

		}

		return builder.getFrontFacing();

	}

}

export default FrontFacingNode;

export const frontFacing = nodeImmutable( FrontFacingNode );
export const faceDirection = float( frontFacing ).mul( 2.0 ).sub( 1.0 );

addNodeClass( 'FrontFacingNode', FrontFacingNode );
