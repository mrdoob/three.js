import { ObjectNode, NumberInput, LabelElement } from '../../libs/flow.module.js';
import { Vector2Node } from '../../renderers/nodes/Nodes.js';

export class Vector2Editor extends ObjectNode {

	constructor() {

		const node = new Vector2Node();

		super( 'Vector 2', 2, node );

		this.title.setIcon( 'ti ti-box-multiple-2' );

		const onUpdate = () => {

			node.value.x = fieldX.getValue();
			node.value.y = fieldY.getValue();

		};

		const fieldX = new NumberInput().onChange( onUpdate );
		const fieldY = new NumberInput().onChange( onUpdate );

		this.add( new LabelElement( 'Values' ).add( fieldX ).add( fieldY ) );

	}

}
