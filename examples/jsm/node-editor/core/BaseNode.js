import { Node, ButtonInput, TitleElement, ContextMenu } from '../../libs/flow.module.js';
import { exportJSON } from '../NodeEditorUtils.js';

export const onNodeValidElement = ( inputElement, outputElement ) => {

	const outputObject = outputElement.getObject();

	if ( ! outputObject || ! outputObject.isNode ) {

		return false;

	}

};

export class BaseNode extends Node {

	constructor( name, outputLength, value = null, width = 300 ) {

		super();

		const getObjectCallback = ( /*output = null*/ ) => {

			return this.value;

		};

		this.setWidth( width );

		const title = new TitleElement( name )
			.setObjectCallback( getObjectCallback )
			.setSerializable( false )
			.setOutput( outputLength );

		const contextButton = new ButtonInput().onClick( () => {

			context.open();

		} ).setIcon( 'ti ti-dots' );

		const onAddButtons = () => {

			context.removeEventListener( 'show', onAddButtons );

			if ( this.value && typeof this.value.toJSON === 'function' ) {

				this.context.add( new ButtonInput( 'Export' ).setIcon( 'ti ti-download' ).onClick( () => {

					exportJSON( this.value.toJSON(), this.constructor.name );

				} ) );

			}

			context.add( new ButtonInput( 'Remove' ).setIcon( 'ti ti-trash' ).onClick( () => {

				this.dispose();

			} ) );

		};

		const context = new ContextMenu( this.dom );
		context.addEventListener( 'show', onAddButtons );

		this.title = title;

		this.contextButton = contextButton;
		this.context = context;

		title.addButton( contextButton );

		this.add( title );

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

	setName( value ) {

		this.title.setTitle( value );

		return this;

	}

	getName() {

		return this.title.getTitle();

	}

	setObjectCallback( callback ) {

		this.title.setObjectCallback( callback );

		return this;

	}

	getObject( callback ) {

		return this.title.getObject( callback );

	}

	setColor( color ) {

		this.title.setColor( color );

		return this;

	}

	setOutputLength( length ) {

		this.title.setOutput( length );

		return this;

	}

	setOutputColor( color ) {

		this.title.setOutputColor( color );

		return this;

	}

	invalidate() {

		this.title.dispatchEvent( new Event( 'connect' ) );

	}

	dispose() {

		this.context.hide();

		super.dispose();

	}

}
