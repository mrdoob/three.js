import { WebVRManager } from "../renderers/webvr/WebVRManager.js";

Object.defineProperties( WebVRManager.prototype, {

	standing: {
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebVRManager: .standing has been removed.' );

		}
	},
	userHeight: {
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebVRManager: .userHeight has been removed.' );

		}
	}

} );
