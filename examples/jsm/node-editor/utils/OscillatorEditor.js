import { ObjectNode, SelectInput, LabelElement } from '../../libs/flow.module.js';
import { OscNode, FloatNode } from '../../renderers/nodes/Nodes.js';

const NULL_VALUE = new FloatNode();

export class OscillatorEditor extends ObjectNode {

	constructor() {

		const node = new OscNode( OscNode.SINE, NULL_VALUE );

		super( 'Oscillator', 1, node, 250 );

		const methodInput = new SelectInput( [
			{ name: 'Sine', value: OscNode.SINE },
			{ name: 'Square', value: OscNode.SQUARE },
			{ name: 'Triangle', value: OscNode.TRIANGLE },
			{ name: 'Sawtooth', value: OscNode.SAWTOOTH }
		] );

		methodInput.onChange( () => {

			node.method = methodInput.getValue();

			this.invalidate();

		} );

		const timeElement = new LabelElement( 'Time' ).setInput( 1 );

		timeElement.onConnect( () => {

			node.timeNode = timeElement.linkedExtra || NULL_VALUE;

		} );

		this.add( new LabelElement( 'Method' ).add( methodInput ) )
			.add( timeElement );

	}

}
