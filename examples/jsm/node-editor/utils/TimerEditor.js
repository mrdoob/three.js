import { NumberInput, LabelElement, Element, ButtonInput } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { TimerNode } from 'three-nodes/Nodes.js';

export class TimerEditor extends BaseNode {

	constructor() {

		const node = new TimerNode();

		super( 'Timer', 1, node, 200 );

		this.title.setIcon( 'ti ti-clock' );

		const updateField = () => {

			field.setValue( node.value.toFixed( 3 ) );

		};

		const field = new NumberInput().onChange( () => {

			node.value = field.getValue();

		} );

		const scaleField = new NumberInput( 1 ).onChange( () => {

			node.scale = scaleField.getValue();

		} );

		const moreElement = new Element().add( new ButtonInput( 'Reset' ).onClick( () => {

			node.value = 0;

			updateField();

		} ) ).setSerializable( false );

		this.add( new Element().add( field ).setSerializable( false ) )
			.add( new LabelElement( 'Speed' ).add( scaleField ) )
			.add( moreElement );

		// extends node

		node._update = node.update;
		node.update = function ( ...params ) {

			this._update( ...params );

			updateField();

		};

	}

}
