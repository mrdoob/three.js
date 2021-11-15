import { ObjectNode } from '../core/ObjectNode.js';
import { NumberInput, LabelElement } from '../../libs/flow.module.js';
import { FloatNode } from '../../renderers/nodes/Nodes.js';

export class FloatEditor extends ObjectNode {

	constructor() {

		const node = new FloatNode( 0 );

		super( 'Float', 1, node );

		this.title.setIcon( 'ti ti-box-multiple-1' );

		const numberField = new NumberInput().onChange( ( input ) => {

			node.value = input.getValue();

		} );

		this.add( new LabelElement( 'Value' ).add( numberField ) );

	}

}
