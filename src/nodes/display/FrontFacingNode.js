import Node, { registerNode } from '../core/Node.js';
import { nodeImmutable, float } from '../tsl/TSLBase.js';

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

FrontFacingNode.type = /*@__PURE__*/ registerNode( 'FrontFacing', FrontFacingNode );

export const frontFacing = /*@__PURE__*/ nodeImmutable( FrontFacingNode );
export const faceDirection = /*@__PURE__*/ float( frontFacing ).mul( 2.0 ).sub( 1.0 );
