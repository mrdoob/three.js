import {
	SphereGeometry,
	BoxGeometry,
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

				geometry = new SphereGeometry( 1, 10, 10 );

			} else if ( options.primitive === 'box' ) {

				geometry = new BoxGeometry( 1, 1, 1 );

			}

			const jointMaterial = new MeshStandardMaterial( { color: 0xffffff, roughness: 1, metalness: 0 } );
			const tipMaterial = new MeshStandardMaterial( { color: 0x999999, roughness: 1, metalness: 0 } );

			const joints = [
				'wrist',
				'thumb-metacarpal',
				'thumb-phalanx-proximal',
				'thumb-phalanx-distal',
				'thumb-tip',
				'index-finger-metacarpal',
				'index-finger-phalanx-proximal',
				'index-finger-phalanx-intermediate',
				'index-finger-phalanx-distal',
				'index-finger-tip',
				'middle-finger-metacarpal',
				'middle-finger-phalanx-proximal',
				'middle-finger-phalanx-intermediate',
				'middle-finger-phalanx-distal',
				'middle-finger-tip',
				'ring-finger-metacarpal',
				'ring-finger-phalanx-proximal',
				'ring-finger-phalanx-intermediate',
				'ring-finger-phalanx-distal',
				'ring-finger-tip',
				'pinky-finger-metacarpal',
				'pinky-finger-phalanx-proximal',
				'pinky-finger-phalanx-intermediate',
				'pinky-finger-phalanx-distal',
				'pinky-finger-tip'
			];

			for ( const jointName of joints ) {

				var cube = new Mesh( geometry, jointName.indexOf( 'tip' ) !== - 1 ? tipMaterial : jointMaterial );
				cube.castShadow = true;
				cube.receiveShadow = true;
				cube.jointName = jointName;
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
			const XRJoint = XRJoints[ jointMesh.jointName ];

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
