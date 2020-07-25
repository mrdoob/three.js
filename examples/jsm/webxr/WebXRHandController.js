import {
	Object3D,
	SphereBufferGeometry,
	MeshStandardMaterial,
	Mesh
} from "../../../build/three.module.js";

function XRHandModel( controller ) {

	Object3D.call( this );

	this.controller = controller;
	this.envMap = null;

	if ( window.XRHand ) {

		var geometry = new SphereBufferGeometry( 1, 10, 10 );
		var jointMaterial = new MeshStandardMaterial( { color: 0x000000, roughness: 0.2, metalness: 0.8 } );
		var tipMaterial = new MeshStandardMaterial( { color: 0x333333, roughness: 0.2, metalness: 0.8 } );

		const tipIndexes = [
			XRHand.THUMB_PHALANX_TIP,
			XRHand.INDEX_PHALANX_TIP,
			XRHand.MIDDLE_PHALANX_TIP,
			XRHand.RING_PHALANX_TIP,
			XRHand.LITTLE_PHALANX_TIP
		];
		for ( let i = 0; i <= XRHand.LITTLE_PHALANX_TIP; i ++ ) {

			var cube = new Mesh( geometry, tipIndexes.indexOf( i ) !== - 1 ? tipMaterial : jointMaterial );
			cube.castShadow = true;
			this.add( cube );

		}

	}

}

XRHandModel.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: XRHandModel,

	updateMatrixWorld: function ( force ) {

		Object3D.prototype.updateMatrixWorld.call( this, force );

		this.updateMesh();

	},

	updateMesh: function () {

		const defaultRadius = 0.008;

		// XR Joints
		const XRJoints = this.controller.joints;
		for ( var i = 0; i < this.children.length; i ++ ) {

			const jointMesh = this.children[ i ];
			const XRJoint = XRJoints[ i ];

			if ( XRJoint.visible ) {

				jointMesh.position.copy( XRJoint.position );
				jointMesh.quaternion.copy( XRJoint.quaternion );
				jointMesh.scale.setScalar( XRJoint.jointRadius || defaultRadius );

			}

			jointMesh.visible = XRJoint.visible;

		}

	}
} );


var XRHandModelFactory = ( function () {

	function XRHandModelFactory() {}

	XRHandModelFactory.prototype = {

		constructor: XRHandModelFactory,

		createHandModel: function ( controller ) {

			const handModel = new XRHandModel( controller );
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
