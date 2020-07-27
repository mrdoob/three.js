import {
	XRHandSpheresModel
} from "./XRHandSpheresModel.js";

var XRHandModelFactory = ( function () {

	function XRHandModelFactory() {}

	XRHandModelFactory.prototype = {

		constructor: XRHandModelFactory,

		createHandModel: function ( controller, profile ) {

			const handModel = new XRHandSpheresModel( controller );
			let scene = null;

			controller.addEventListener( 'connected', ( event ) => {

				const xrInputSource = event.data;
				console.log( "Connected!", xrInputSource );

				if ( xrInputSource.hand ) {

					handModel.xrInputSource = xrInputSource;

				}

			} );

			controller.addEventListener( 'disconnected', () => {

				handModel.motionController = null;
				handModel.remove( scene );
				scene = null;

			} );

			return handModel;

		}

	};

	return XRHandModelFactory;

} )();


export { XRHandModelFactory };
