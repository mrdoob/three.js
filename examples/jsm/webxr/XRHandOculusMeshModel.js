import { FBXLoader } from '../loaders/FBXLoader.js';

class XRHandOculusMeshModel {

	constructor( handModel, controller, path, handedness, options ) {

		this.controller = controller;
		this.handModel = handModel;

		this.bones = [];
		const loader = new FBXLoader();
		const low = options && options.model === 'lowpoly' ? '_low' : '';

		loader.setPath( path );
		loader.load( `OculusHand_${handedness === 'right' ? 'R' : 'L'}${low}.fbx`, object => {

			this.handModel.add( object );
			// Hack because of the scale of the skinnedmesh
			object.scale.setScalar( 0.01 );

			const mesh = object.getObjectByProperty( 'type', 'SkinnedMesh' );
			mesh.frustumCulled = false;
			mesh.castShadow = true;
			mesh.receiveShadow = true;

			const bonesMapping = [
				'b_%_wrist', // XRHand.WRIST,

				'b_%_thumb1', // XRHand.THUMB_METACARPAL,
				'b_%_thumb2', // XRHand.THUMB_PHALANX_PROXIMAL,
				'b_%_thumb3', // XRHand.THUMB_PHALANX_DISTAL,
				'b_%_thumb_null', // XRHand.THUMB_PHALANX_TIP,

				null, //'b_%_index1', // XRHand.INDEX_METACARPAL,
				'b_%_index1', // XRHand.INDEX_PHALANX_PROXIMAL,
				'b_%_index2', // XRHand.INDEX_PHALANX_INTERMEDIATE,
				'b_%_index3', // XRHand.INDEX_PHALANX_DISTAL,
				'b_%_index_null', // XRHand.INDEX_PHALANX_TIP,

				null, //'b_%_middle1', // XRHand.MIDDLE_METACARPAL,
				'b_%_middle1', // XRHand.MIDDLE_PHALANX_PROXIMAL,
				'b_%_middle2', // XRHand.MIDDLE_PHALANX_INTERMEDIATE,
				'b_%_middle3', // XRHand.MIDDLE_PHALANX_DISTAL,
				'b_%_middlenull', // XRHand.MIDDLE_PHALANX_TIP,

				null, //'b_%_ring1', // XRHand.RING_METACARPAL,
				'b_%_ring1', // XRHand.RING_PHALANX_PROXIMAL,
				'b_%_ring2', // XRHand.RING_PHALANX_INTERMEDIATE,
				'b_%_ring3', // XRHand.RING_PHALANX_DISTAL,
				'b_%_ring_inull', // XRHand.RING_PHALANX_TIP,

				'b_%_pinky0', // XRHand.LITTLE_METACARPAL,
				'b_%_pinky1', // XRHand.LITTLE_PHALANX_PROXIMAL,
				'b_%_pinky2', // XRHand.LITTLE_PHALANX_INTERMEDIATE,
				'b_%_pinky3', // XRHand.LITTLE_PHALANX_DISTAL,
				'b_%_pinkynull', // XRHand.LITTLE_PHALANX_TIP
			];

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
				'pinky-finger-tip',
			];

			let i = 0;

			bonesMapping.forEach( boneName => {

				if ( boneName ) {

					const bone = object.getObjectByName( boneName.replace( /%/g, handedness === 'right' ? 'r' : 'l' ) );

					if ( bone !== undefined) {

						bone.jointName = joints [ i ];

					}

					this.bones.push( bone );

				} else {

					this.bones.push( null );

				}

				i ++;

			} );

		} );

	}

	updateMesh() {

		// XR Joints
		const XRJoints = this.controller.joints;
		for ( let i = 0; i < this.bones.length; i ++ ) {

			const bone = this.bones[ i ];

			if ( bone ) {

				const XRJoint = XRJoints[ bone.jointName ];

				if ( XRJoint.visible ) {

					const position = XRJoint.position;

					if ( bone ) {

						bone.position.copy( position.clone().multiplyScalar( 100 ) );
						bone.quaternion.copy( XRJoint.quaternion );
						// bone.scale.setScalar( XRJoint.jointRadius || defaultRadius );

					}

				}

			}

		}

	}

}

export { XRHandOculusMeshModel };
