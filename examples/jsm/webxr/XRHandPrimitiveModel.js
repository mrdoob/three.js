import {
	DynamicDrawUsage,
	SphereGeometry,
	BoxGeometry,
	MeshStandardMaterial,
	InstancedMesh,
	Matrix4,
	Vector3
} from 'three';

const _matrix = new Matrix4();
const _vector = new Vector3();

/**
 * Represents one of the hand model types {@link XRHandModelFactory} might produce
 * depending on the selected profile. `XRHandPrimitiveModel` represents a hand
 * with sphere or box primitives according to the selected `primitive` option.
 */
class XRHandPrimitiveModel {

	/**
	 * Constructs a new XR hand primitive model.
	 *
	 * @param {XRHandModel} handModel - The hand model.
	 * @param {Group} controller - The WebXR controller.
	 * @param {string} path - The model path.
	 * @param {XRHandedness} handedness - The handedness of the XR input source.
	 * @param {XRHandPrimitiveModel~Options} options - The model options.
	 */
	constructor( handModel, controller, path, handedness, options ) {

		/**
		 * The WebXR controller.
		 *
		 * @type {Group}
		 */
		this.controller = controller;

		/**
		 * The hand model.
		 *
		 * @type {XRHandModel}
		 */
		this.handModel = handModel;

		/**
		 * The model's environment map.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.envMap = null;

		let geometry;

		if ( ! options || ! options.primitive || options.primitive === 'sphere' ) {

			geometry = new SphereGeometry( 1, 10, 10 );

		} else if ( options.primitive === 'box' ) {

			geometry = new BoxGeometry( 1, 1, 1 );

		}

		const material = new MeshStandardMaterial();

		this.handMesh = new InstancedMesh( geometry, material, 30 );
		this.handMesh.frustumCulled = false;
		this.handMesh.instanceMatrix.setUsage( DynamicDrawUsage ); // will be updated every frame
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

	}

	/**
	 * Updates the mesh based on the tracked XR joints data.
	 */
	updateMesh() {

		const defaultRadius = 0.008;
		const joints = this.controller.joints;

		let count = 0;

		for ( let i = 0; i < this.joints.length; i ++ ) {

			const joint = joints[ this.joints[ i ] ];

			if ( joint.visible ) {

				_vector.setScalar( joint.jointRadius || defaultRadius );
				_matrix.compose( joint.position, joint.quaternion, _vector );
				this.handMesh.setMatrixAt( i, _matrix );

				count ++;

			}

		}

		this.handMesh.count = count;
		this.handMesh.instanceMatrix.needsUpdate = true;

	}

}

/**
 * Constructor options of `XRHandPrimitiveModel`.
 *
 * @typedef {Object} XRHandPrimitiveModel~Options
 * @property {('box'|'sphere')} [primitive] - The primitive type.
 **/

export { XRHandPrimitiveModel };
