import { NumberInput, LabelElement, Element, ButtonInput } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { timerLocal } from 'three/nodes';

export class TimerEditor extends BaseNodeEditor {

	constructor() {

		const node = timerLocal();

		super( 'Timer', node, 200 );

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
