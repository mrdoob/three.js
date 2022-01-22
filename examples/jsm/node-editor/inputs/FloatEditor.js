import { NumberInput, Element } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { FloatNode } from '../../renderers/nodes/Nodes.js';

export class FloatEditor extends BaseNode {

	constructor() {

		const node = new FloatNode();

		super( 'Float', 1, node, 150 );

		const field = new NumberInput().setTagColor( 'red' ).onChange( () => {

			node.value = field.getValue();

		} );

		this.add( new Element().add( field ) );

	}

}
