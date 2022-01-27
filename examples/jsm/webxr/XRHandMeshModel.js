import { Quaternion } from '../../../build/three.module.js';
import { GLTFLoader } from '../loaders/GLTFLoader.js';

const DEFAULT_HAND_PROFILE_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/';

const _oculusBrowserV14CorrectionRight = new Quaternion().identity();
const _oculusBrowserV14CorrectionLeft = new Quaternion().identity();

if ( /OculusBrowser\/14\./.test( navigator.userAgent ) ) {
    _oculusBrowserV14CorrectionRight
    	.setFromAxisAngle( { x: 0, y: 1, z: 0 }, Math.PI / 2 );

    _oculusBrowserV14CorrectionLeft
    	.setFromAxisAngle( { x: 1, y: 0, z: 0 }, Math.PI )
        .premultiply( _oculusBrowserV14CorrectionRight );
}

class XRHandMeshModel {

	constructor( handModel, controller, path, handedness ) {

		this.controller = controller;
		this.handModel = handModel;

        this.oculusBrowserV14Correction = handedness === 'left' 
        	? _oculusBrowserV14CorrectionLeft 
        	: _oculusBrowserV14CorrectionRight;

		this.bones = [];

		const loader = new GLTFLoader();
		loader.setPath( path || DEFAULT_HAND_PROFILE_PATH );
		loader.load( `${handedness}.glb`, gltf => {

			const object = gltf.scene.children[ 0 ];
			this.handModel.add( object );

			const mesh = object.getObjectByProperty( 'type', 'SkinnedMesh' );
			mesh.frustumCulled = false;
			mesh.castShadow = true;
			mesh.receiveShadow = true;

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

			joints.forEach( jointName => {

				const bone = object.getObjectByName( jointName );

				if ( bone !== undefined ) {

					bone.jointName = jointName;

				} else {

					console.warn( `Couldn't find ${jointName} in ${handedness} hand mesh` );

				}

				this.bones.push( bone );

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

						bone.position.copy( position );
						bone.quaternion.copy( XRJoint.quaternion )
                            .multiply( this.oculusBrowserV14Correction );
						// bone.scale.setScalar( XRJoint.jointRadius || defaultRadius );

					}

				}

			}

		}

	}

}

export { XRHandMeshModel };
