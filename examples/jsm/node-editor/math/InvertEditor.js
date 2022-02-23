import { SelectInput, LabelElement } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { MathNode, FloatNode } from 'three-nodes/Nodes.js';

const DEFAULT_VALUE = new FloatNode();

export class InvertEditor extends BaseNode {

	constructor() {

		const node = new MathNode( MathNode.Invert, DEFAULT_VALUE );

		super( 'Invert / Negate', 1, node, 175 );

		const optionsField = new SelectInput( [
			{ name: 'Invert ( 1 - Source )', value: MathNode.Invert },
			{ name: 'Negate ( - Source )', value: MathNode.Negate }
		], MathNode.Invert ).onChange( () => {

			node.method = optionsField.getValue();

			this.invalidate();

		} );

		const input = new LabelElement( 'Source' ).setInput( 1 );

		input.onConnect( () => {

			node.aNode = input.getLinkedObject() || DEFAULT_VALUE;

		} );

		this.add( new LabelElement( 'Method' ).add( optionsField ) )
			.add( input );

	}

}
