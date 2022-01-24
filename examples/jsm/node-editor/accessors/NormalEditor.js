import { SelectInput, Element } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { NormalNode } from '../../renderers/nodes/Nodes.js';

export class NormalEditor extends BaseNode {

	constructor() {

		const node = new NormalNode();

		super( 'Normal', 3, node, 200 );

		const optionsField = new SelectInput( [
			{ name: 'Local', value: NormalNode.LOCAL },
			{ name: 'World', value: NormalNode.WORLD },
			{ name: 'View', value: NormalNode.VIEW }
		], NormalNode.LOCAL ).onChange( () => {

			node.scope = optionsField.getValue();

			this.invalidate();

		} );

		this.add( new Element().add( optionsField ) );

	}

}
