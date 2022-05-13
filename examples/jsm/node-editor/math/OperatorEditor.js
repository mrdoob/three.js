import { Element, LabelElement, NumberInput, SelectInput } from '../../libs/flow.module.js';
import { UniformNode, OperatorNode } from 'three-nodes/Nodes.js';
import { BaseNode } from '../core/BaseNode.js';

export class OperatorEditor extends BaseNode {

	constructor() {

		const NULL_VALUE = new UniformNode( 0 );

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


		aElement.add( new NumberInput().onChange( ( field ) => {

			node.aNode.value = field.getValue();

		} ) ).onConnect( ( elmt ) => {

			elmt.setEnabledInputs( ! elmt.getLinkedObject() );
			node.aNode = elmt.getLinkedObject() || NULL_VALUE;

		} );

		bElement.add( new NumberInput().onChange( ( field ) => {

			node.bNode.value = field.getValue();

		} ) ).onConnect( ( elmt ) => {

			elmt.setEnabledInputs( ! elmt.getLinkedObject() );
			node.bNode = elmt.getLinkedObject() || NULL_VALUE;

		} );


		this.add( new Element().add( opInput ) )
			.add( aElement )
			.add( bElement );

	}

}
