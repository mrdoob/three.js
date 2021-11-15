import { ObjectNode } from '../core/ObjectNode.js';
import { NumberInput, LabelElement } from '../../libs/flow.module.js';
import { CheckerNode, UVNode } from '../../renderers/nodes/Nodes.js';

const DEFAULT_UV = new UVNode();

export class CheckerEditor extends ObjectNode {

	constructor() {

		const node = new CheckerNode();

		super( 'Checker', 1, node );

		const uvField = new LabelElement( 'UV' ).setStyle( 'right' ).setInput( 2 );

		uvField.onConnect( () => {

			node.uvNode = uvField.linkedExtra || DEFAULT_UV;

		} );

		this.add( uvField );

	}

}
