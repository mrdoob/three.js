import { ObjectNode, LabelElement } from '../../libs/flow.module.js';
import { MathNode, FloatNode } from '../../renderers/nodes/Nodes.js';

const NULL_VALUE = new FloatNode();
const ONE_VALUE = new FloatNode( 1 );

export class BlendEditor extends ObjectNode {

	constructor() {

		const node = new MathNode( MathNode.MIX, NULL_VALUE, NULL_VALUE, ONE_VALUE );

		super( 'Blend', 3, node );

		const aElement = new LabelElement( 'Base' ).setInput( 3 );
		const bElement = new LabelElement( 'Blend' ).setInput( 3 );
		const cElement = new LabelElement( 'Opacity' ).setInput( 1 );

		aElement.onConnect( () => {

			node.aNode = aElement.linkedExtra || NULL_VALUE;

		} );

		bElement.onConnect( () => {

			node.bNode = bElement.linkedExtra || NULL_VALUE;

		} );

		cElement.onConnect( () => {

			node.cNode = cElement.linkedExtra || ONE_VALUE;

		} );

		this.add( aElement )
			.add( bElement )
			.add( cElement );

	}

}
