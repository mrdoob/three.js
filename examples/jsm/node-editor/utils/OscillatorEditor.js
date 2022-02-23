import { SelectInput, LabelElement, Element } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { OscNode, FloatNode } from 'three-nodes/Nodes.js';

const NULL_VALUE = new FloatNode();

export class OscillatorEditor extends BaseNode {

	constructor() {

		const node = new OscNode( OscNode.Sine, NULL_VALUE );

		super( 'Oscillator', 1, node, 175 );

		const methodInput = new SelectInput( [
			{ name: 'Sine', value: OscNode.Sine },
			{ name: 'Square', value: OscNode.Square },
			{ name: 'Triangle', value: OscNode.Triangle },
			{ name: 'Sawtooth', value: OscNode.Sawtooth }
		], OscNode.Sine );

		methodInput.onChange( () => {

			node.method = methodInput.getValue();

			this.invalidate();

		} );

		const timeElement = new LabelElement( 'Time' ).setInput( 1 );

		timeElement.onConnect( () => {

			node.timeNode = timeElement.getLinkedObject() || NULL_VALUE;

		} );

		this.add( new Element().add( methodInput ) )
			.add( timeElement );

	}

}
