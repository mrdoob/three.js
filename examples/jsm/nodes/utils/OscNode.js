import Node from '../core/Node.js';
import TimerNode from './TimerNode.js';
import { abs, fract, round, sin, add, sub, mul, PI2 } from '../ShaderNode.js';

class OscNode extends Node {

	static Sine = 'sine';
	static Square = 'square';
	static Triangle = 'triangle';
	static Sawtooth = 'sawtooth';

	constructor( method = OscNode.Sine, timeNode = new TimerNode() ) {

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

		if ( method === OscNode.Sine ) {

			outputNode = add( mul( sin( mul( add( timeNode, .75 ), PI2 ) ), .5 ), .5 );

		} else if ( method === OscNode.Square ) {

			outputNode = round( fract( timeNode ) );

		} else if ( method === OscNode.Triangle ) {

			outputNode = abs( sub( 1, mul( fract( add( timeNode, .5 ) ), 2 ) ) );

		} else if ( method === OscNode.Sawtooth ) {

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
