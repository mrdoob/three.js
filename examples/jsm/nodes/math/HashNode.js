import Node, { addNodeClass } from '../core/Node.js';
import { add, mul, bitXor, shiftRight } from './OperatorNode.js';
import { addNodeElement, nodeProxy, uint } from '../shadernode/ShaderNode.js';

class HashNode extends Node {

	constructor( seedNode ) {

		super();

		this.seedNode = seedNode;

	}

	construct( /*builder*/ ) {

		const seed = this.seedNode;

		const state = add( mul( uint( seed ), 747796405 ), 2891336453 );
		const word = mul( bitXor( shiftRight( state, add( shiftRight( state, 28 ), 4 ) ), state ), 277803737 );
		const uintResult = bitXor( shiftRight( word, 22 ), word );

		return mul( 1 / 2 ** 32, uintResult ); // Convert to range [0, 1)

	}

}

export default HashNode;

export const hash = nodeProxy( HashNode );

addNodeElement( 'hash', hash );

addNodeClass( HashNode );
