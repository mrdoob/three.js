import {
	SphereBufferGeometry,
	BoxBufferGeometry,
	MeshStandardMaterial,
	Mesh,
	Group
} from '../../../build/three.module.js';

class XRHandPrimitiveModel {

	constructor( handModel, controller, path, handedness, options ) {

		this.controller = controller;
		this.handModel = handModel;

	  this.envMap = null;

		this.handMesh = new Group();
		this.handModel.add( this.handMesh );

		if ( window.XRHand ) {

			let geometry;

			if ( ! options || ! options.primitive || options.primitive === 'sphere' ) {

				geometry = new SphereBufferGeometry( 1, 10, 10 );

			} else if ( options.primitive === 'box' ) {

				geometry = new BoxBufferGeometry( 1, 1, 1 );

			}

			const jointMaterial = new MeshStandardMaterial( { color: 0xffffff, roughness: 1, metalness: 0 } );
			const tipMaterial = new MeshStandardMaterial( { color: 0x999999, roughness: 1, metalness: 0 } );

			const tipIndexes = [
				window.XRHand.THUMB_PHALANX_TIP,
				window.XRHand.INDEX_PHALANX_TIP,
				window.XRHand.MIDDLE_PHALANX_TIP,
				window.XRHand.RING_PHALANX_TIP,
				window.XRHand.LITTLE_PHALANX_TIP
			];
			for ( let i = 0; i <= window.XRHand.LITTLE_PHALANX_TIP; i ++ ) {

				var cube = new Mesh( geometry, tipIndexes.indexOf( i ) !== - 1 ? tipMaterial : jointMaterial );
				cube.castShadow = true;
				cube.receiveShadow = true;
				this.handMesh.add( cube );

			}

		}

	}

	updateMesh() {

		const defaultRadius = 0.008;
		const objects = this.handMesh.children;

		// XR Joints
		const XRJoints = this.controller.joints;

		for ( let i = 0; i < objects.length; i ++ ) {

			const jointMesh = objects[ i ];
			const XRJoint = XRJoints[ i ];

			if ( XRJoint.visible ) {

				jointMesh.position.copy( XRJoint.position );
				jointMesh.quaternion.copy( XRJoint.quaternion );
				jointMesh.scale.setScalar( XRJoint.jointRadius || defaultRadius );

			}

			jointMesh.visible = XRJoint.visible;

		}

	}

}

export { XRHandPrimitiveModel };
