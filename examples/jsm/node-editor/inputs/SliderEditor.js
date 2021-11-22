import { ObjectNode, ButtonInput, SliderInput, NumberInput, LabelElement, Element } from '../../libs/flow.module.js';
import { FloatNode } from '../../renderers/nodes/Nodes.js';

export class SliderEditor extends ObjectNode {

	constructor() {

		const node = new FloatNode();

		super( 'Slider', 1, node );

		this.title.setIcon( 'ti ti-adjustments-horizontal' );

		this.collapse = true;

		const field = new SliderInput( 0, 0, 1 ).onChange( () => {

			node.value = field.getValue();

		} );

		const updateRange = () => {

			const min = minInput.getValue();
			const max = maxInput.getValue();

			if ( min <= max ) {

				field.setRange( min, max );

			} else {

				maxInput.setValue( min );

			}

		};

		const minInput = new NumberInput().onChange( updateRange );
		const maxInput = new NumberInput( 1 ).onChange( updateRange );

		const minElement = new LabelElement( 'Min.' ).add( minInput ).setVisible( false );
		const maxElement = new LabelElement( 'Max.' ).add( maxInput ).setVisible( false );

		const moreElement = new Element().add( new ButtonInput( 'More' ).onClick( () => {

			minElement.setVisible( true );
			maxElement.setVisible( true );
			moreElement.setVisible( false );

		} ) ).setSerializable( false );

		this.add( new LabelElement( 'Value' ).add( field ) )
			.add( minElement )
			.add( maxElement )
			.add( moreElement );

		this.onBlur( () => {

			minElement.setVisible( false );
			maxElement.setVisible( false );
			moreElement.setVisible( true );

		} );

	}

}
