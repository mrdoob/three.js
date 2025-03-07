import {
	RGBAFormat,
	FloatType
} from '../constants.js';
import { Bone } from './Bone.js';
import { Matrix4 } from '../math/Matrix4.js';
import { DataTexture } from '../textures/DataTexture.js';
import { generateUUID } from '../math/MathUtils.js';

const _offsetMatrix = /*@__PURE__*/ new Matrix4();
const _identityMatrix = /*@__PURE__*/ new Matrix4();

/**
 * Class for representing the armatures in `three.js`. The skeleton
 * is defined by a hierarchy of bones.
 *
 * ```js
 * const bones = [];
 *
 * const shoulder = new THREE.Bone();
 * const elbow = new THREE.Bone();
 * const hand = new THREE.Bone();
 *
 * shoulder.add( elbow );
 * elbow.add( hand );
 *
 * bones.push( shoulder , elbow, hand);
 *
 * shoulder.position.y = -5;
 * elbow.position.y = 0;
 * hand.position.y = 5;
 *
 * const armSkeleton = new THREE.Skeleton( bones );
 * ```
 */
class Skeleton {

	/**
	 * Constructs a new skeleton.
	 *
	 * @param {Array<Bone>} [bones] - An array of bones.
	 * @param {Array<Matrix4>} [boneInverses] - An array of bone inverse matrices.
	 * If not provided, these matrices will be computed automatically via {@link Skeleton#calculateInverses}.
	 */
	constructor( bones = [], boneInverses = [] ) {

		this.uuid = generateUUID();

		/**
		 * An array of bones defining the skeleton.
		 *
		 * @type {Array<Bone>}
		 */
		this.bones = bones.slice( 0 );

		/**
		 * An array of bone inverse matrices.
		 *
		 * @type {Array<Matrix4>}
		 */
		this.boneInverses = boneInverses;

		/**
		 * An array buffer holding the bone data.
		 * Input data for {@link Skeleton#boneTexture}.
		 *
		 * @type {?Float32Array}
		 * @default null
		 */
		this.boneMatrices = null;

		/**
		 * A texture holding the bone data for use
		 * in the vertex shader.
		 *
		 * @type {?DataTexture}
		 * @default null
		 */
		this.boneTexture = null;

		this.init();

	}

	/**
	 * Initializes the skeleton. This method gets automatically called by the constructor
	 * but depending on how the skeleton is created it might be necessary to call this method
	 * manually.
	 */
	init() {

		const bones = this.bones;
		const boneInverses = this.boneInverses;

		this.boneMatrices = new Float32Array( bones.length * 16 );

		// calculate inverse bone matrices if necessary

		if ( boneInverses.length === 0 ) {

			this.calculateInverses();

		} else {

			// handle special case

			if ( bones.length !== boneInverses.length ) {

				console.warn( 'THREE.Skeleton: Number of inverse bone matrices does not match amount of bones.' );

				this.boneInverses = [];

				for ( let i = 0, il = this.bones.length; i < il; i ++ ) {

					this.boneInverses.push( new Matrix4() );

				}

			}

		}

	}

	/**
	 * Computes the bone inverse matrices. This method resets {@link Skeleton#boneInverses}
	 * and fills it with new matrices.
	 */
	calculateInverses() {

		this.boneInverses.length = 0;

		for ( let i = 0, il = this.bones.length; i < il; i ++ ) {

			const inverse = new Matrix4();

			if ( this.bones[ i ] ) {

				inverse.copy( this.bones[ i ].matrixWorld ).invert();

			}

			this.boneInverses.push( inverse );

		}

	}

	/**
	 * Resets the skeleton to the base pose.
	 */
	pose() {

		// recover the bind-time world matrices

		for ( let i = 0, il = this.bones.length; i < il; i ++ ) {

			const bone = this.bones[ i ];

			if ( bone ) {

				bone.matrixWorld.copy( this.boneInverses[ i ] ).invert();

			}

		}

		// compute the local matrices, positions, rotations and scales

		for ( let i = 0, il = this.bones.length; i < il; i ++ ) {

			const bone = this.bones[ i ];

			if ( bone ) {

				if ( bone.parent && bone.parent.isBone ) {

					bone.matrix.copy( bone.parent.matrixWorld ).invert();
					bone.matrix.multiply( bone.matrixWorld );

				} else {

					bone.matrix.copy( bone.matrixWorld );

				}

				bone.matrix.decompose( bone.position, bone.quaternion, bone.scale );

			}

		}

	}

	/**
	 * Resets the skeleton to the base pose.
	 */
	update() {

		const bones = this.bones;
		const boneInverses = this.boneInverses;
		const boneMatrices = this.boneMatrices;
		const boneTexture = this.boneTexture;

		// flatten bone matrices to array

		for ( let i = 0, il = bones.length; i < il; i ++ ) {

			// compute the offset between the current and the original transform

			const matrix = bones[ i ] ? bones[ i ].matrixWorld : _identityMatrix;

			_offsetMatrix.multiplyMatrices( matrix, boneInverses[ i ] );
			_offsetMatrix.toArray( boneMatrices, i * 16 );

		}

		if ( boneTexture !== null ) {

			boneTexture.needsUpdate = true;

		}

	}

	/**
	 * Returns a new skeleton with copied values from this instance.
	 *
	 * @return {Skeleton} A clone of this instance.
	 */
	clone() {

		return new Skeleton( this.bones, this.boneInverses );

	}

	/**
	 * Computes a data texture for passing bone data to the vertex shader.
	 *
	 * @return {Skeleton} A reference of this instance.
	 */
	computeBoneTexture() {

		// layout (1 matrix = 4 pixels)
		//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
		//  with  8x8  pixel texture max   16 bones * 4 pixels =  (8 * 8)
		//       16x16 pixel texture max   64 bones * 4 pixels = (16 * 16)
		//       32x32 pixel texture max  256 bones * 4 pixels = (32 * 32)
		//       64x64 pixel texture max 1024 bones * 4 pixels = (64 * 64)

		let size = Math.sqrt( this.bones.length * 4 ); // 4 pixels needed for 1 matrix
		size = Math.ceil( size / 4 ) * 4;
		size = Math.max( size, 4 );

		const boneMatrices = new Float32Array( size * size * 4 ); // 4 floats per RGBA pixel
		boneMatrices.set( this.boneMatrices ); // copy current values

		const boneTexture = new DataTexture( boneMatrices, size, size, RGBAFormat, FloatType );
		boneTexture.needsUpdate = true;

		this.boneMatrices = boneMatrices;
		this.boneTexture = boneTexture;

		return this;

	}

	/**
	 * Searches through the skeleton's bone array and returns the first with a
	 * matching name.
	 *
	 * @param {string} name - The name of the bone.
	 * @return {Bone|undefined} The found bone. `undefined` if no bone has been found.
	 */
	getBoneByName( name ) {

		for ( let i = 0, il = this.bones.length; i < il; i ++ ) {

			const bone = this.bones[ i ];

			if ( bone.name === name ) {

				return bone;

			}

		}

		return undefined;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose( ) {

		if ( this.boneTexture !== null ) {

			this.boneTexture.dispose();

			this.boneTexture = null;

		}

	}

	/**
	 * Setups the skeleton by the given JSON and bones.
	 *
	 * @param {Object} json - The skeleton as serialized JSON.
	 * @param {Object<string, Bone>} bones - An array of bones.
	 * @return {Skeleton} A reference of this instance.
	 */
	fromJSON( json, bones ) {

		this.uuid = json.uuid;

		for ( let i = 0, l = json.bones.length; i < l; i ++ ) {

			const uuid = json.bones[ i ];
			let bone = bones[ uuid ];

			if ( bone === undefined ) {

				console.warn( 'THREE.Skeleton: No bone found with UUID:', uuid );
				bone = new Bone();

			}

			this.bones.push( bone );
			this.boneInverses.push( new Matrix4().fromArray( json.boneInverses[ i ] ) );

		}

		this.init();

		return this;

	}

	/**
	 * Serializes the skeleton into JSON.
	 *
	 * @return {Object} A JSON object representing the serialized skeleton.
	 * @see {@link ObjectLoader#parse}
	 */
	toJSON() {

		const data = {
			metadata: {
				version: 4.6,
				type: 'Skeleton',
				generator: 'Skeleton.toJSON'
			},
			bones: [],
			boneInverses: []
		};

		data.uuid = this.uuid;

		const bones = this.bones;
		const boneInverses = this.boneInverses;

		for ( let i = 0, l = bones.length; i < l; i ++ ) {

			const bone = bones[ i ];
			data.bones.push( bone.uuid );

			const boneInverse = boneInverses[ i ];
			data.boneInverses.push( boneInverse.toArray() );

		}

		return data;

	}

}

export { Skeleton };
