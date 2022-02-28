import { LabelElement } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { CheckerNode, UVNode } from 'three-nodes/Nodes.js';

const defaultUV = new UVNode();

export class CheckerEditor extends BaseNode {

	constructor() {

		const node = new CheckerNode( defaultUV );

		super( 'Checker', 1, node, 200 );

		const field = new LabelElement( 'UV' ).setInput( 2 );

		field.onConnect( () => {

			node.uvNode = field.getLinkedObject() || defaultUV;

		} );

		this.add( field );

	}

}
