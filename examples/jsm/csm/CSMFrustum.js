import { Vector3, Matrix4 } from 'three';

const inverseProjectionMatrix = new Matrix4();

/**
 * Represents the frustum of a CSM instance.
 *
 * @three_import import { CSMFrustum } from 'three/addons/csm/CSMFrustum.js';
 */
class CSMFrustum {

	/**
	 * Constructs a new CSM frustum.
	 *
	 * @param {CSMFrustum~Data} [data] - The CSM data.
	 */
	constructor( data ) {

		data = data || {};

		/**
		 * The zNear value. This value depends on whether the CSM
		 * is used with WebGL or WebGPU. Both API use different
		 * conventions for their projection matrices.
		 *
		 * @type {number}
		 */
		this.zNear = data.webGL === true ? - 1 : 0;

		/**
		 * An object representing the vertices of the near and
		 * far plane in view space.
		 *
		 * @type {Object}
		 */
		this.vertices = {
			near: [
				new Vector3(),
				new Vector3(),
				new Vector3(),
				new Vector3()
			],
			far: [
				new Vector3(),
				new Vector3(),
				new Vector3(),
				new Vector3()
			]
		};

		if ( data.projectionMatrix !== undefined ) {

			this.setFromProjectionMatrix( data.projectionMatrix, data.maxFar || 10000 );

		}

	}

	/**
	 * Setups this CSM frustum from the given projection matrix and max far value.
	 *
	 * @param {Matrix4} projectionMatrix - The projection matrix, usually of the scene's camera.
	 * @param {number} maxFar - The maximum far value.
	 * @returns {Object} An object representing the vertices of the near and far plane in view space.
	 */
	setFromProjectionMatrix( projectionMatrix, maxFar ) {

		const zNear = this.zNear;
		const isOrthographic = projectionMatrix.elements[ 2 * 4 + 3 ] === 0;

		inverseProjectionMatrix.copy( projectionMatrix ).invert();

		// 3 --- 0  vertices.near/far order
		// |     |
		// 2 --- 1
		// clip space spans from [-1, 1]

		this.vertices.near[ 0 ].set( 1, 1, zNear );
		this.vertices.near[ 1 ].set( 1, - 1, zNear );
		this.vertices.near[ 2 ].set( - 1, - 1, zNear );
		this.vertices.near[ 3 ].set( - 1, 1, zNear );
		this.vertices.near.forEach( function ( v ) {

			v.applyMatrix4( inverseProjectionMatrix );

		} );

		this.vertices.far[ 0 ].set( 1, 1, 1 );
		this.vertices.far[ 1 ].set( 1, - 1, 1 );
		this.vertices.far[ 2 ].set( - 1, - 1, 1 );
		this.vertices.far[ 3 ].set( - 1, 1, 1 );
		this.vertices.far.forEach( function ( v ) {

			v.applyMatrix4( inverseProjectionMatrix );

			const absZ = Math.abs( v.z );
			if ( isOrthographic ) {

				v.z *= Math.min( maxFar / absZ, 1.0 );

			} else {

				v.multiplyScalar( Math.min( maxFar / absZ, 1.0 ) );

			}

		} );

		return this.vertices;

	}

	/**
	 * Splits the CSM frustum by the given array. The new CSM frustum are pushed into the given
	 * target array.
	 *
	 * @param {Array<number>} breaks - An array of numbers in the range `[0,1]` the defines how the
	 * CSM frustum should be split up.
	 * @param {Array<CSMFrustum>} target - The target array that holds the new CSM frustums.
	 */
	split( breaks, target ) {

		while ( breaks.length > target.length ) {

			target.push( new CSMFrustum() );

		}

		target.length = breaks.length;

		for ( let i = 0; i < breaks.length; i ++ ) {

			const cascade = target[ i ];

			if ( i === 0 ) {

				for ( let j = 0; j < 4; j ++ ) {

					cascade.vertices.near[ j ].copy( this.vertices.near[ j ] );

				}

			} else {

				for ( let j = 0; j < 4; j ++ ) {

					cascade.vertices.near[ j ].lerpVectors( this.vertices.near[ j ], this.vertices.far[ j ], breaks[ i - 1 ] );

				}

			}

			if ( i === breaks.length - 1 ) {

				for ( let j = 0; j < 4; j ++ ) {

					cascade.vertices.far[ j ].copy( this.vertices.far[ j ] );

				}

			} else {

				for ( let j = 0; j < 4; j ++ ) {

					cascade.vertices.far[ j ].lerpVectors( this.vertices.near[ j ], this.vertices.far[ j ], breaks[ i ] );

				}

			}

		}

	}

	/**
	 * Transforms the given target CSM frustum into the different coordinate system defined by the
	 * given camera matrix.
	 *
	 * @param {Matrix4} cameraMatrix - The matrix that defines the new coordinate system.
	 * @param {CSMFrustum} target - The CSM to convert.
	 */
	toSpace( cameraMatrix, target ) {

		for ( let i = 0; i < 4; i ++ ) {

			target.vertices.near[ i ]
				.copy( this.vertices.near[ i ] )
				.applyMatrix4( cameraMatrix );

			target.vertices.far[ i ]
				.copy( this.vertices.far[ i ] )
				.applyMatrix4( cameraMatrix );

		}

	}

}

/**
 * Constructor data of `CSMFrustum`.
 *
 * @typedef {Object} CSMFrustum~Data
 * @property {boolean} [webGL] - Whether this CSM frustum is used with WebGL or WebGPU.
 * @property {Matrix4} [projectionMatrix] - A projection matrix usually of the scene's camera.
 * @property {number} [maxFar] - The maximum far value.
 **/

export { CSMFrustum };
