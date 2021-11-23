import { ObjectNode, LabelElement } from '../../libs/flow.module.js';
import { CheckerNode, UVNode } from '../../renderers/nodes/Nodes.js';

const DEFAULT_UV = new UVNode();

export class CheckerEditor extends ObjectNode {

	constructor() {

		const node = new CheckerNode( DEFAULT_UV );

		super( 'Checker', 1, node, 200 );

		const field = new LabelElement( 'UV' ).setInput( 2 );

		field.onConnect( () => {

			node.uvNode = field.linkedExtra || DEFAULT_UV;

		} );

		this.add( field );

	}

}
