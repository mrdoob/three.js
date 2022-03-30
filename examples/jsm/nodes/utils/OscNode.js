import Node from '../core/Node.js';
import TimerNode from './TimerNode.js';
import { abs, fract, round, sin, add, sub, mul } from '../shadernode/ShaderNodeElements.js';

class OscNode extends Node {

	static SINE = 'sine';
	static SQUARE = 'square';
	static TRIANGLE = 'triangle';
	static SAWTOOTH = 'sawtooth';

	constructor( method = OscNode.SINE, timeNode = new TimerNode() ) {

		super();

		this.method = method;
		this.timeNode = timeNode;

	}

	getNodeType( builder ) {

		return this.timeNode.getNodeType( builder );

	}

	generate( builder ) {

		const method = this.method;
		const timeNode = this.timeNode;

		let outputNode = null;

		if ( method === OscNode.SINE ) {

			outputNode = add( mul( sin( mul( add( timeNode, .75 ), Math.PI * 2 ) ), .5 ), .5 );

		} else if ( method === OscNode.SQUARE ) {

			outputNode = round( fract( timeNode ) );

		} else if ( method === OscNode.TRIANGLE ) {

			outputNode = abs( sub( 1, mul( fract( add( timeNode, .5 ) ), 2 ) ) );

		} else if ( method === OscNode.SAWTOOTH ) {

			outputNode = fract( timeNode );

		}

		return outputNode.build( builder );

	}

	serialize( data ) {

		super.serialize( data );

		data.method = this.method;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.method = data.method;

	}

}

export default OscNode;
