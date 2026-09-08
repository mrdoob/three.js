import { Tab } from 'three/addons/inspector/ui/Tab.js';
import { getItem, setItem } from './Inspector.js';

export class Extension extends Tab {

	constructor( name, options = {} ) {

		super( name, options );

		this.isExtension = true;

	}

	init( inspector ) {

		super.init( inspector );

		if ( this._handleLayout && this._inspector ) {

			this._inspector.removeEventListener( 'orientationchange', this._handleLayout );
			this._inspector.removeEventListener( 'layoutchange', this._handleLayout );
			this._inspector.removeEventListener( 'resize', this._handleLayout );
			window.removeEventListener( 'resize', this._handleLayout );

		}

		this._inspector = inspector;

		this._handleLayout = ( event ) => {

			this.onOrientationChange( event );
			this.onLayoutChange( event );

		};

		if ( inspector ) {

			inspector.addEventListener( 'orientationchange', this._handleLayout );
			inspector.addEventListener( 'layoutchange', this._handleLayout );
			inspector.addEventListener( 'resize', this._handleLayout );

		}

		window.addEventListener( 'resize', this._handleLayout );

		const data = getItem( this.name );

		if ( Object.keys( data ).length > 0 ) {

			this.deserialize( data );

		}

	}

	serialize() {

		return {};

	}

	deserialize( /* data */ ) {

	}

	save() {

		const data = this.serialize();

		if ( data === null || ( typeof data === 'object' && Object.keys( data ).length === 0 ) ) {

			setItem( this.name, null );

		} else {

			setItem( this.name, data );

		}

	}

	dispose() {

		if ( this._handleLayout ) {

			if ( this._inspector ) {

				this._inspector.removeEventListener( 'orientationchange', this._handleLayout );
				this._inspector.removeEventListener( 'layoutchange', this._handleLayout );
				this._inspector.removeEventListener( 'resize', this._handleLayout );

			}

			window.removeEventListener( 'resize', this._handleLayout );
			this._handleLayout = null;

		}

		this._inspector = null;

	}

	onOrientationChange( /* event */ ) { }

	onLayoutChange( /* event */ ) { }

}
