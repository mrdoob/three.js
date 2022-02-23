import { SelectInput, Element } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { PositionNode } from 'three-nodes/Nodes.js';

export class PositionEditor extends BaseNode {

	constructor() {

		const node = new PositionNode();

		super( 'Position', 3, node, 200 );

		const optionsField = new SelectInput( [
			{ name: 'Local', value: PositionNode.Local },
			{ name: 'World', value: PositionNode.World },
			{ name: 'View', value: PositionNode.View },
			{ name: 'View Direction', value: PositionNode.ViewDirection }
		], PositionNode.Local ).onChange( () => {

			node.scope = optionsField.getValue();

			this.invalidate();

		} );

		this.add( new Element().add( optionsField ) );

	}

}
