import { ObjectNode, SelectInput, LabelElement } from '../../libs/flow.module.js';
import { PositionNode } from '../../renderers/nodes/Nodes.js';

export class PositionEditor extends ObjectNode {

	constructor() {

		const node = new PositionNode();

		super( 'Position', 3, node, 250 );

		this.title.setStyle( 'red' );

		const optionsField = new SelectInput( [
			{ name: 'Local', value: PositionNode.LOCAL },
			{ name: 'World', value: PositionNode.WORLD },
			{ name: 'View', value: PositionNode.VIEW }
		] ).onChange( () => {

			node.scope = optionsField.getValue();

			this.invalidate();

		} );

		this.add( new LabelElement( 'Scope' ).add( optionsField ) );

	}

}
