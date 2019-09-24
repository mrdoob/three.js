import { Loader } from "../loaders/Loader.js";
import { LoaderUtils } from "../loaders/LoaderUtils.js";

Loader.Handlers = {

	add: function ( /* regex, loader */ ) {

		console.error( 'THREE.Loader: Handlers.add() has been removed. Use LoadingManager.addHandler() instead.' );

	},

	get: function ( /* file */ ) {

		console.error( 'THREE.Loader: Handlers.get() has been removed. Use LoadingManager.getHandler() instead.' );

	}

};

Object.assign( Loader.prototype, {

	extractUrlBase: function ( url ) {

		console.warn( 'THREE.Loader: .extractUrlBase() has been deprecated. Use THREE.LoaderUtils.extractUrlBase() instead.' );
		return LoaderUtils.extractUrlBase( url );

	}

} );
