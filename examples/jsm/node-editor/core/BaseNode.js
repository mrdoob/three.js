import { ObjectNode } from '../../libs/flow.module.js';

export const onNodeValidElement = ( inputElement, outputElement ) => {

	const outputObject = outputElement.getObject();

	if ( ! outputObject || ! outputObject.isNode ) {

		return false;

	}

};

export class BaseNode extends ObjectNode {

	constructor( name, inputLength, value = null, width = 300 ) {

		const getObjectCallback = ( /*output = null*/ ) => {

			return this.value;

		};

		super( name, inputLength, getObjectCallback, width );

		this.setOutputColor( this.getColorValueFromValue( value ) );

		this.editor = null;

		this.value = value;

		this.onValidElement = onNodeValidElement;

	}

	getColor() {

		return ( this.getColorValueFromValue( this.value ) || '#777777' ) + 'BB';

	}

	serialize( data ) {

		super.serialize( data );

		delete data.width;

	}

	deserialize( data ) {

		delete data.width;

		super.deserialize( data );

	}

	setEditor( value ) {

		this.editor = value;

		return this;

	}

	getColorValueFromValue( value ) {

		if ( ! value ) return;

		if ( value.isMaterial === true ) {

			//return 'forestgreen';
			return '#228b22';

		} else if ( value.isObject3D === true ) {

			return '#ffa500';

		} else if ( value.isDataFile === true ) {

			return '#00ffff';

		}

	}

	add( element ) {

		element.onValid( ( source, target ) => this.onValidElement( source, target ) );

		return super.add( element );

	}

}
