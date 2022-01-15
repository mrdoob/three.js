import { ObjectNode, NumberInput, LabelElement } from '../../libs/flow.module.js';
import { Vector3Node } from '../../renderers/nodes/Nodes.js';

export class Vector3Editor extends ObjectNode {

	constructor() {

		const node = new Vector3Node();

		super( 'Vector 3', 3, node );

		this.title.setIcon( 'ti ti-box-multiple-3' );

		const onUpdate = () => {

			node.value.x = fieldX.getValue();
			node.value.y = fieldY.getValue();
			node.value.z = fieldZ.getValue();

		};

		const fieldX = new NumberInput().onChange( onUpdate );
		const fieldY = new NumberInput().onChange( onUpdate );
		const fieldZ = new NumberInput().onChange( onUpdate );

		this.add( new LabelElement( 'Values' ).add( fieldX ).add( fieldY ).add( fieldZ ) );

	}

}
