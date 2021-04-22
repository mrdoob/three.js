import {
	SphereGeometry,
	BoxGeometry,
	MeshStandardMaterial,
	InstancedMesh,
	Matrix4,
	Vector3
} from '../../../build/three.module.js';

class XRHandPrimitiveModel {

	constructor( handModel, controller, path, handedness, options ) {

		this.controller = controller;
		this.handModel = handModel;
		this.envMap = null;

		let geometry;
		const jointMaterial = new MeshStandardMaterial( { color: 0xffffff, roughness: 1, metalness: 0 } );

		if ( ! options || ! options.primitive || options.primitive === 'sphere' ) {

			geometry = new SphereGeometry( 1, 10, 10 );

		} else if ( options.primitive === 'box' ) {

			geometry = new BoxGeometry( 1, 1, 1 );

		}

		this.handMesh = new InstancedMesh( geometry, jointMaterial, 30 );
		this.handMesh.castShadow = true;
		this.handMesh.receiveShadow = true;
		this.handModel.add( this.handMesh );

		this.joints = [
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

		this.tempMat = new Matrix4(); this.tempVec = new Vector3( 1, 1, 1 );

	}

	updateMesh() {

		const defaultRadius = 0.008;

		// XR Joints
		const XRJoints = this.controller.joints;
		let count = 0;

		for ( let i = 0; i < this.joints.length; i ++ ) {

			const XRJoint = XRJoints[ this.joints[ i ] ];

			if ( XRJoint.visible ) {

				this.handMesh.setMatrixAt( i, this.tempMat.compose( XRJoint.position, XRJoint.quaternion,
					this.tempVec.set( 1, 1, 1 ).multiplyScalar( XRJoint.jointRadius || defaultRadius ) ) );
				count ++;

			}

		}

		this.handMesh.count = count;
		if ( this.handMesh.instanceMatrix ) {

			this.handMesh.instanceMatrix.needsUpdate = true;

		}

	}

}

export { XRHandPrimitiveModel };
