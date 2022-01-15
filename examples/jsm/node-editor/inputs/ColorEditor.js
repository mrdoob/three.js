import { ObjectNode, ColorInput, StringInput, NumberInput, LabelElement } from '../../libs/flow.module.js';
import { ColorNode } from '../../renderers/nodes/Nodes.js';

export class ColorEditor extends ObjectNode {

	constructor() {

		const node = new ColorNode();

		super( 'Color', 1, node );

		this.title.setIcon( 'ti ti-palette' );

		const updateFields = ( editing ) => {

			const value = node.value;
			const hexValue = value.getHex();

			if ( editing !== 'color' ) {

				field.setValue( hexValue, false );

			}

			if ( editing !== 'hex' ) {

				hexField.setValue( '#' + hexValue.toString( 16 ).toUpperCase().padEnd( 6, '0' ), false );

			}

			if ( editing !== 'rgb' ) {

				fieldR.setValue( value.r.toFixed( 3 ), false );
				fieldG.setValue( value.g.toFixed( 3 ), false );
				fieldB.setValue( value.b.toFixed( 3 ), false );

			}

		};

		const field = new ColorInput( 0xFFFFFF ).onChange( () => {

			node.value.setHex( field.getValue() );

			updateFields( 'picker' );

		} );

		const hexField = new StringInput().onChange( () => {

			const value = hexField.getValue();

			if ( value.indexOf( '#' ) === 0 ) {

				const hexStr = value.substr( 1 ).padEnd( 6, '0' );

				node.value.setHex( parseInt( hexStr, 16 ) );

				updateFields( 'hex' );

			}

		} );

		hexField.addEventListener( 'blur', () => {

			updateFields();

		} );

		const onChangeRGB = () => {

			node.value.setRGB( fieldR.getValue(), fieldG.getValue(), fieldB.getValue() );

			updateFields( 'rgb' );

		};

		const fieldR = new NumberInput( 1, 0, 1 ).onChange( onChangeRGB );
		const fieldG = new NumberInput( 1, 0, 1 ).onChange( onChangeRGB );
		const fieldB = new NumberInput( 1, 0, 1 ).onChange( onChangeRGB );

		this.add( new LabelElement( 'Value' ).add( field ).setSerializable( false ) )
			.add( new LabelElement( 'Hex' ).add( hexField ).setSerializable( false ) )
			.add( new LabelElement( 'RGB' ).add( fieldR ).add( fieldG ).add( fieldB ) );

		updateFields();

	}

}
