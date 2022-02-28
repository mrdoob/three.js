import { NumberInput, LabelElement } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { Vector2Node } from 'three-nodes/Nodes.js';

export class Vector2Editor extends BaseNode {

	constructor() {

		const node = new Vector2Node();

		super( 'Vector 2', 2, node );

		const onUpdate = () => {

			node.value.x = fieldX.getValue();
			node.value.y = fieldY.getValue();

		};

		const fieldX = new NumberInput().setTagColor( 'red' ).onChange( onUpdate );
		const fieldY = new NumberInput().setTagColor( 'green' ).onChange( onUpdate );

		this.add( new LabelElement( 'XY' ).add( fieldX ).add( fieldY ) );

	}

}
