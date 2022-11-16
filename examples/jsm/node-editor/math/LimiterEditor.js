import { SelectInput, LabelElement, Element, NumberInput } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { MathNode, UniformNode } from 'three/nodes';

export class LimiterEditor extends BaseNode {

	constructor() {

		const NULL_VALUE = new UniformNode( 0 );

		const node = new MathNode( MathNode.MIN, NULL_VALUE, NULL_VALUE );

		super( 'Limiter', 1, node, 175 );

		const methodInput = new SelectInput( [
			{ name: 'Min', value: MathNode.MIN },
			{ name: 'Max', value: MathNode.MAX },
			// { name: 'Clamp', value: MathNode.CLAMP }
			{ name: 'Saturate', value: MathNode.SATURATE }
		], MathNode.MIN );

		methodInput.onChange( ( data ) => {

			node.method = data.getValue();
			bElement.setVisible( data.getValue() !== MathNode.SATURATE );

			this.invalidate();

		} );

		const aElement = new LabelElement( 'A' ).setInput( 1 );
		const bElement = new LabelElement( 'B' ).setInput( 1 );

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

		this.add( new Element().add( methodInput ) )
			.add( aElement )
			.add( bElement );

	}

}
