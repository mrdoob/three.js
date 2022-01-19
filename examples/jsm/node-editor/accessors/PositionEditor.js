import { SelectInput, Element } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { PositionNode } from '../../renderers/nodes/Nodes.js';

export class PositionEditor extends BaseNode {

	constructor() {

		const node = new PositionNode();

		super( 'Position', 3, node, 200 );

		const optionsField = new SelectInput( [
			{ name: 'Local', value: PositionNode.LOCAL },
			{ name: 'World', value: PositionNode.WORLD },
			{ name: 'View', value: PositionNode.VIEW }
		], PositionNode.LOCAL ).onChange( () => {

			node.scope = optionsField.getValue();

			this.invalidate();

		} );

		this.add( new Element().add( optionsField ) );

	}

}
