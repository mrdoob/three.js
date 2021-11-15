import { ObjectNode } from '../core/ObjectNode.js';
import { LabelElement } from '../../libs/flow.module.js';
import { CheckerNode, UVNode } from '../../renderers/nodes/Nodes.js';

const DEFAULT_UV = new UVNode();

export class CheckerEditor extends ObjectNode {

	constructor() {

		const node = new CheckerNode();

		super( 'Checker', 1, node );

		this.title.setStyle( 'yellow' );

		const field = new LabelElement( 'UV' ).setInput( 2 );

		field.onConnect( () => {

			node.uvNode = field.linkedExtra || DEFAULT_UV;

		} );

		this.add( field );

	}

}
