import { ObjectNode } from '../core/ObjectNode.js';
import { ColorInput, LabelElement } from '../../libs/flow.module.js';
import { ColorNode } from '../../renderers/nodes/Nodes.js';

export class ColorEditor extends ObjectNode {

	constructor() {

		const node = new ColorNode();

		super( 'Color', 1, node );

		this.title.setIcon( 'ti ti-palette' );

		const colorField = new ColorInput( 0xFFFFFF ).onChange( ( input ) => {

			const hex = parseInt( input.getValue() );

			node.value.setHex( hex );

		} );

		this.add( new LabelElement( 'Value' ).add( colorField ) );

	}

}
