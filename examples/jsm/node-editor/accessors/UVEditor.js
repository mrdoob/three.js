import { ObjectNode } from '../core/ObjectNode.js';
import { SelectInput, LabelElement } from '../../libs/flow.module.js';
import { UVNode } from '../../renderers/nodes/Nodes.js';

export class UVEditor extends ObjectNode {

	constructor() {

		const node = new UVNode();

		super( 'UV', 2, node );

		const optionsField = new SelectInput( [ '1', '2' ] ).onChange( () => {

			node.value = Number( optionsField.getValue() );

			this.invalidate();

		} );

		this.add( new LabelElement( 'Channel' ).add( optionsField ) );

	}

}
