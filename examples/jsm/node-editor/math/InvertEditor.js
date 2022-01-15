import { ObjectNode, SelectInput, LabelElement } from '../../libs/flow.module.js';
import { MathNode, FloatNode } from '../../renderers/nodes/Nodes.js';

const DEFAULT_VALUE = new FloatNode();

export class InvertEditor extends ObjectNode {

	constructor() {

		const node = new MathNode( MathNode.INVERT, DEFAULT_VALUE );

		super( 'Invert / Negate', 1, node );

		const optionsField = new SelectInput( [
			{ name: 'Invert ( 1 - Source )', value: MathNode.INVERT },
			{ name: 'Negate ( - Source )', value: MathNode.NEGATE }
		] ).onChange( () => {

			node.method = optionsField.getValue();

			this.invalidate();

		} );

		const input = new LabelElement( 'Source' ).setInput( 1 );

		input.onConnect( () => {

			node.aNode = input.linkedExtra || DEFAULT_VALUE;

		} );

		this.add( new LabelElement( 'Method' ).add( optionsField ) )
			.add( input );

	}

}
