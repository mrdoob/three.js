import { SelectInput, LabelElement, Element } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { OperatorNode, FloatNode } from '../../renderers/nodes/Nodes.js';

const NULL_VALUE = new FloatNode();

export class OperatorEditor extends BaseNode {

	constructor() {

		const node = new OperatorNode( '+', NULL_VALUE, NULL_VALUE );

		super( 'Operator', 1, node, 150 );

		const opInput = new SelectInput( [
			{ name: 'Addition ( + )', value: '+' },
			{ name: 'Subtraction ( - )', value: '-' },
			{ name: 'Multiplication ( * )', value: '*' },
			{ name: 'Division ( / )', value: '/' }
		], '+' );

		opInput.onChange( ( data ) => {

			node.op = data.getValue();

			this.invalidate();

		} );

		const aElement = new LabelElement( 'A' ).setInput( 3 );
		const bElement = new LabelElement( 'B' ).setInput( 3 );

		aElement.onConnect( () => {

			node.aNode = aElement.getLinkedObject() || NULL_VALUE;

		} );

		bElement.onConnect( () => {

			node.bNode = bElement.getLinkedObject() || NULL_VALUE;

		} );

		this.add( new Element().add( opInput ) )
			.add( aElement )
			.add( bElement );

	}

}
