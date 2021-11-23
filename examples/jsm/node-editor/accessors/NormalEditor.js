import { ObjectNode, SelectInput, LabelElement } from '../../libs/flow.module.js';
import { NormalNode } from '../../renderers/nodes/Nodes.js';

export class NormalEditor extends ObjectNode {

	constructor() {

		const node = new NormalNode();

		super( 'Normal', 3, node, 250 );

		this.title.setStyle( 'red' );

		const optionsField = new SelectInput( [
			{ name: 'Local', value: NormalNode.LOCAL },
			{ name: 'World', value: NormalNode.WORLD },
			{ name: 'View', value: NormalNode.VIEW }
		] ).onChange( () => {

			node.scope = optionsField.getValue();

			this.invalidate();

		} );

		this.add( new LabelElement( 'Scope' ).add( optionsField ) );

	}

}
