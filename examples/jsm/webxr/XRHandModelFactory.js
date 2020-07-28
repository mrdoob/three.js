import {
	Object3D
} from '../../../build/three.module.js';

import {
	XRHandPrimitiveModel
} from './XRHandPrimitiveModel.js';

import {
	XRHandOculusMeshModel
} from './XRHandOculusMeshModel.js';

function XRHandModel( controller ) {

	Object3D.call( this );

	this.controller = controller;
	this.motionController = null;
	this.envMap = null;

	this.mesh = null;

}

XRHandModel.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: XRHandModel,

	updateMatrixWorld: function ( force ) {

		Object3D.prototype.updateMatrixWorld.call( this, force );

		if ( this.motionController ) {

			this.motionController.updateMesh();

		}

	},
} );


const XRHandModelFactory = ( function () {

	function XRHandModelFactory() {

		this.path = '';

	}

	XRHandModelFactory.prototype = {

		constructor: XRHandModelFactory,

		setPath: function ( path ) {

			this.path = path;
			return this;

		},

		createHandModel: function ( controller, profile, options ) {

			const handModel = new XRHandModel( controller );

			controller.addEventListener( 'connected', ( event ) => {

				const xrInputSource = event.data;

				if ( xrInputSource.hand && ! handModel.motionController ) {

					handModel.visible = true;
					handModel.xrInputSource = xrInputSource;

					// @todo Detect profile if not provided
					if ( profile === undefined || profile === 'spheres' ) {

						handModel.motionController = new XRHandPrimitiveModel( handModel, controller, this.path, xrInputSource.handedness, { primitive: 'sphere' } );

					} else if ( profile === 'boxes' ) {

						handModel.motionController = new XRHandPrimitiveModel( handModel, controller, this.path, xrInputSource.handedness, { primitive: 'box' } );

					} else if ( profile === 'oculus' ) {

						handModel.motionController = new XRHandOculusMeshModel( handModel, controller, this.path, xrInputSource.handedness, options );

					}

				}

			} );

			controller.addEventListener( 'disconnected', () => {

				// handModel.motionController = null;
				// handModel.remove( scene );
				// scene = null;

			} );

			return handModel;

		}

	};

	return XRHandModelFactory;

} )();


export { XRHandModelFactory };
