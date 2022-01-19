import { SelectInput, LabelElement, Element } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { MathNode, FloatNode } from '../../renderers/nodes/Nodes.js';

const NULL_VALUE = new FloatNode();

export class LimiterEditor extends BaseNode {

	constructor() {

		const node = new MathNode( MathNode.MIN, NULL_VALUE, NULL_VALUE );

		super( 'Limiter', 1, node, 175 );

		const methodInput = new SelectInput( [
			{ name: 'Min', value: MathNode.MIN },
			{ name: 'Max', value: MathNode.MAX }
		], MathNode.MIN );

		methodInput.onChange( ( data ) => {

			node.method = data.getValue();

			this.invalidate();

		} );

		const aElement = new LabelElement( 'A' ).setInput( 1 );
		const bElement = new LabelElement( 'B' ).setInput( 1 );

		aElement.onConnect( () => {

			node.aNode = aElement.getLinkedObject() || NULL_VALUE;

		} );

		bElement.onConnect( () => {

			node.bNode = bElement.getLinkedObject() || NULL_VALUE;

		} );

		this.add( new Element().add( methodInput ) )
			.add( aElement )
			.add( bElement );

	}

}
