import { ObjectNode, NumberInput, LabelElement } from '../../libs/flow.module.js';
import { Vector4Node } from '../../renderers/nodes/Nodes.js';

export class Vector4Editor extends ObjectNode {

	constructor() {

		const node = new Vector4Node();

		super( 'Vector 4', 4, node );

		this.title.setIcon( 'ti ti-box-multiple-4' );

		const onUpdate = () => {

			node.value.x = fieldX.getValue();
			node.value.y = fieldY.getValue();
			node.value.z = fieldZ.getValue();
			node.value.w = fieldW.getValue();

		};

		const fieldX = new NumberInput().onChange( onUpdate );
		const fieldY = new NumberInput().onChange( onUpdate );
		const fieldZ = new NumberInput().onChange( onUpdate );
		const fieldW = new NumberInput().onChange( onUpdate );

		this.add( new LabelElement( 'Values' )
			.add( fieldX )
			.add( fieldY )
			.add( fieldZ )
			.add( fieldW )
		);

	}

}
