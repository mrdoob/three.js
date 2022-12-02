import { NumberInput, LabelElement } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { Vector4 } from 'three';
import { UniformNode } from 'three/nodes';

export class Vector4Editor extends BaseNode {

	constructor() {

		const node = new UniformNode( new Vector4() );

		super( 'Vector 4', 4, node, 350 );

		const onUpdate = () => {

			node.value.x = fieldX.getValue();
			node.value.y = fieldY.getValue();
			node.value.z = fieldZ.getValue();
			node.value.w = fieldW.getValue();

		};

		const fieldX = new NumberInput().setTagColor( 'red' ).onChange( onUpdate );
		const fieldY = new NumberInput().setTagColor( 'green' ).onChange( onUpdate );
		const fieldZ = new NumberInput().setTagColor( 'blue' ).onChange( onUpdate );
		const fieldW = new NumberInput( 1 ).setTagColor( 'white' ).onChange( onUpdate );

		this.add( new LabelElement( 'XYZW' )
			.add( fieldX )
			.add( fieldY )
			.add( fieldZ )
			.add( fieldW )
		);

	}

}
