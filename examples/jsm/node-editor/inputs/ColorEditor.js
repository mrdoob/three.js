import { ColorInput, StringInput, NumberInput, LabelElement, Element } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { Color } from 'three';
import { UniformNode } from 'three-nodes/Nodes.js';

export class ColorEditor extends BaseNode {

	constructor() {

		const node = new UniformNode( new Color() );

		super( 'Color', 3, node );

		const updateFields = ( editing ) => {

			const value = node.value;
			const hexValue = value.getHex();
			const hexString = hexValue.toString( 16 ).toUpperCase().padStart( 6, '0' );

			if ( editing !== 'color' ) {

				field.setValue( hexValue, false );

			}

			if ( editing !== 'hex' ) {

				hexField.setValue( '#' + hexString, false );

			}

			if ( editing !== 'rgb' ) {

				fieldR.setValue( value.r.toFixed( 3 ), false );
				fieldG.setValue( value.g.toFixed( 3 ), false );
				fieldB.setValue( value.b.toFixed( 3 ), false );

			}

			fieldR.setTagColor( `#${hexString.slice( 0, 2 )}0000` );
			fieldG.setTagColor( `#00${hexString.slice( 2, 4 )}00` );
			fieldB.setTagColor( `#0000${hexString.slice( 4, 6 )}` );

		};

		const field = new ColorInput( 0xFFFFFF ).onChange( () => {

			node.value.setHex( field.getValue() );

			updateFields( 'picker' );

		} );

		const hexField = new StringInput().onChange( () => {

			const value = hexField.getValue();

			if ( value.indexOf( '#' ) === 0 ) {

				const hexStr = value.slice( 1 ).padEnd( 6, '0' );

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

		const fieldR = new NumberInput( 1, 0, 1 ).setTagColor( 'red' ).onChange( onChangeRGB );
		const fieldG = new NumberInput( 1, 0, 1 ).setTagColor( 'green' ).onChange( onChangeRGB );
		const fieldB = new NumberInput( 1, 0, 1 ).setTagColor( 'blue' ).onChange( onChangeRGB );

		this.add( new Element().add( field ).setSerializable( false ) )
			.add( new LabelElement( 'Hex' ).add( hexField ).setSerializable( false ) )
			.add( new LabelElement( 'RGB' ).add( fieldR ).add( fieldG ).add( fieldB ) );

		updateFields();

	}

}
