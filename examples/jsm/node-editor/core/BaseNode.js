import { ObjectNode } from '../../libs/flow.module.js';

export class BaseNode extends ObjectNode {

	constructor( name, inputLength, value = null, width = 300 ) {

		const getObjectCallback = ( /*output = null*/ ) => {

			return this.value;

		};

		super( name, inputLength, getObjectCallback, width );

		this.setOutputColor( this.getColorValueFromValue( value ) );

		this.editor = null;

		this.value = value;

		this.onValidElement = ( inputElement, outputElement ) => {

			const outputObject = outputElement.getObject();

			if ( ! outputObject || ! outputObject.isNode ) {

				return false;

			}

		};

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

			return 'forestgreen';

		} else if ( value.isObject3D === true ) {

			return 'orange';

		}

	}

	add( element ) {

		element.onValid( ( source, target ) => this.onValidElement( source, target ) );

		return super.add( element );

	}

}
