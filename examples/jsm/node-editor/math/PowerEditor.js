import { ObjectNode, LabelElement } from '../../libs/flow.module.js';
import { MathNode, FloatNode } from '../../renderers/nodes/Nodes.js';

const NULL_VALUE = new FloatNode();

export class PowerEditor extends ObjectNode {

	constructor() {

		const node = new MathNode( MathNode.POW, NULL_VALUE, NULL_VALUE );

		super( 'Power', 1, node, 200 );

		const aElement = new LabelElement( 'A' ).setInput( 1 );
		const bElement = new LabelElement( 'B' ).setInput( 1 );

		aElement.onConnect( () => {

			node.aNode = aElement.linkedExtra || NULL_VALUE;

		} );

		bElement.onConnect( () => {

			node.bNode = bElement.linkedExtra || NULL_VALUE;

		} );

		this.add( aElement )
			.add( bElement );

	}

}
