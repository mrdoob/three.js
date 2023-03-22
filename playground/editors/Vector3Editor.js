import { NumberInput, LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { Vector3 } from 'three';
import { UniformNode } from 'three/nodes';

export class Vector3Editor extends BaseNodeEditor {

	constructor() {

		const node = new UniformNode( new Vector3() );

		super( 'Vector 3', node, 325 );

		this.setOutputLength( 3 );

		const onUpdate = () => {

			node.value.x = fieldX.getValue();
			node.value.y = fieldY.getValue();
			node.value.z = fieldZ.getValue();

		};

		const fieldX = new NumberInput().setTagColor( 'red' ).onChange( onUpdate );
		const fieldY = new NumberInput().setTagColor( 'green' ).onChange( onUpdate );
		const fieldZ = new NumberInput().setTagColor( 'blue' ).onChange( onUpdate );

		this.add( new LabelElement( 'XYZ' ).add( fieldX ).add( fieldY ).add( fieldZ ) );

	}

}
