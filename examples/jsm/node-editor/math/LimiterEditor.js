import { ObjectNode, SelectInput, LabelElement } from '../../libs/flow.module.js';
import { MathNode, FloatNode } from '../../renderers/nodes/Nodes.js';

const NULL_VALUE = new FloatNode();

export class LimiterEditor extends ObjectNode {

	constructor() {

		const node = new MathNode( MathNode.MAX, NULL_VALUE, NULL_VALUE );

		super( 'Limiter', 1, node, 250 );

		const methodInput = new SelectInput( [
			{ name: 'Max', value: MathNode.MAX },
			{ name: 'Min', value: MathNode.MIN }
		] );

		methodInput.onChange( ( data ) => {

			node.method = data.getValue();

			this.invalidate();

		} );

		const aElement = new LabelElement( 'A' ).setInput( 1 );
		const bElement = new LabelElement( 'B' ).setInput( 1 );

		aElement.onConnect( () => {

			node.aNode = aElement.linkedExtra || NULL_VALUE;

		} );

		bElement.onConnect( () => {

			node.bNode = bElement.linkedExtra || NULL_VALUE;

		} );

		this.add( new LabelElement( 'Method' ).add( methodInput ) )
			.add( aElement )
			.add( bElement );

	}

}
