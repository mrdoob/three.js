import { SelectInput, Element, LabelElement } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { MathNode, Vector3Node } from '../../renderers/nodes/Nodes.js';

const DEFAULT_VALUE = new Vector3Node();

export class TrigonometryEditor extends BaseNode {

	constructor() {

		const node = new MathNode( MathNode.SIN, DEFAULT_VALUE );

		super( 'Trigonometry', 1, node, 175 );

		const optionsField = new SelectInput( [
			{ name: 'Sin', value: MathNode.SIN },
			{ name: 'Cos', value: MathNode.COS },
			{ name: 'Tan', value: MathNode.TAN }
		], MathNode.SIN ).onChange( () => {

			node.method = optionsField.getValue();

			this.invalidate();

		} );

		const input = new LabelElement( 'A' ).setInput( 1 );

		input.onConnect( () => {

			node.aNode = input.getLinkedObject() || DEFAULT_VALUE;

		} );

		this.add( new Element().add( optionsField ) )
			.add( input );

	}

}
