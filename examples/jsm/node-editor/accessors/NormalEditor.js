import { SelectInput, Element } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { NormalNode } from 'three-nodes/Nodes.js';

export class NormalEditor extends BaseNode {

	constructor() {

		const node = new NormalNode();

		super( 'Normal', 3, node, 200 );

		const optionsField = new SelectInput( [
			{ name: 'Local', value: NormalNode.Local },
			{ name: 'World', value: NormalNode.World },
			{ name: 'View', value: NormalNode.View },
			{ name: 'Geometry', value: NormalNode.Geometry }
		], NormalNode.Local ).onChange( () => {

			node.scope = optionsField.getValue();

			this.invalidate();

		} );

		this.add( new Element().add( optionsField ) );

	}

}
