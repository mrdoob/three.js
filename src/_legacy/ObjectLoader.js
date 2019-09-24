import { ObjectLoader } from "../loaders/ObjectLoader.js";

Object.assign( ObjectLoader.prototype, {

	setTexturePath: function ( value ) {

		console.warn( 'THREE.ObjectLoader: .setTexturePath() has been renamed to .setResourcePath().' );
		return this.setResourcePath( value );

	}

} );
