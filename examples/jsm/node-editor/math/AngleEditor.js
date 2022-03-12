import { SelectInput, Element, LabelElement } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { Vector3 } from 'three';
import { MathNode, UniformNode } from 'three-nodes/Nodes.js';

const DEFAULT_VALUE = new UniformNode( new Vector3() );

export class AngleEditor extends BaseNode {

	constructor() {

		const node = new MathNode( MathNode.SIN, DEFAULT_VALUE );

		super( 'Angle', 1, node, 175 );

		const optionsField = new SelectInput( [
			{ name: 'Degrees to Radians', value: MathNode.RAD },
			{ name: 'Radians to Degrees', value: MathNode.DEG }
		], MathNode.RAD ).onChange( () => {

			node.method = optionsField.getValue();

			this.invalidate();

		} );

		const input = new LabelElement( 'A' ).setInput( 1 );

		input.onConnect( () => {

			node.aNode = input.getLinkedObject() || DEFAULT_VALUE;

		} );

		this.add( new Element().add( optionsField ) )
			.add( input );

	}

}
