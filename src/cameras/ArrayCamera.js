import { PerspectiveCamera } from './PerspectiveCamera.js';
import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';

const _posL = /*@__PURE__*/ new Vector3();
const _posR = /*@__PURE__*/ new Vector3();
const _quatL = /*@__PURE__*/ new Quaternion();
const _quatR = /*@__PURE__*/ new Quaternion();
const _scale = /*@__PURE__*/ new Vector3();
const _corner = /*@__PURE__*/ new Vector3();
const _view = /*@__PURE__*/ new Vector3();
const _dir = /*@__PURE__*/ new Vector3();

const _ndcCorners = [
	[ - 1, - 1, - 1 ], [ 1, - 1, - 1 ], [ - 1, 1, - 1 ], [ 1, 1, - 1 ],
	[ - 1, - 1, 1 ], [ 1, - 1, 1 ], [ - 1, 1, 1 ], [ 1, 1, 1 ]
];

/**
 * This type of camera can be used in order to efficiently render a scene with a
 * predefined set of cameras. This is an important performance aspect for
 * rendering VR scenes.
 *
 * An instance of `ArrayCamera` always has an array of sub cameras. It's mandatory
 * to define for each sub camera the `viewport` property which determines the
 * part of the viewport that is rendered with this camera.
 *
 * @augments PerspectiveCamera
 */
class ArrayCamera extends PerspectiveCamera {

	/**
	 * Constructs a new array camera.
	 *
	 * @param {Array<PerspectiveCamera>} [array=[]] - An array of perspective sub cameras.
	 */
	constructor( array = [] ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isArrayCamera = true;

		/**
		 * Whether this camera is used with multiview rendering or not.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default false
		 */
		this.isMultiViewCamera = false;

		/**
		 * An array of perspective sub cameras.
		 *
		 * @type {Array<PerspectiveCamera>}
		 */
		this.cameras = array;

	}

	/**
	 * Sets this camera's world transform and projection matrix to a perspective
	 * frustum that contains the view volumes of both given cameras.
	 *
	 * Used by WebXR to build a single culling camera from the left and right
	 * eye views. The cameras do not need to be parallel or share an axis; their
	 * projection and world matrices must already be set.
	 *
	 * @param {PerspectiveCamera} cameraL - The left camera.
	 * @param {PerspectiveCamera} cameraR - The right camera.
	 * @return {ArrayCamera} A reference to this camera.
	 */
	setProjectionFromUnion( cameraL, cameraR ) {

		cameraL.matrixWorld.decompose( _posL, _quatL, _scale );
		cameraR.matrixWorld.decompose( _posR, _quatR, _scale );

		this.position.addVectors( _posL, _posR ).multiplyScalar( 0.5 );
		this.quaternion.copy( _quatL ).slerp( _quatR, 0.5 );
		this.scale.set( 1, 1, 1 );
		this.matrixWorld.compose( this.position, this.quaternion, this.scale );
		this.matrixWorldInverse.copy( this.matrixWorld ).invert();

		const projL = cameraL.projectionMatrix.elements;
		const projR = cameraR.projectionMatrix.elements;
		const infiniteFar = projL[ 10 ] === - 1.0 || projR[ 10 ] === - 1.0;

		let nearSrc = projL[ 14 ] / ( projL[ 10 ] - 1 );
		const nearR = projR[ 14 ] / ( projR[ 10 ] - 1 );

		if ( Number.isFinite( nearR ) ) {

			nearSrc = Math.min( nearSrc, nearR );

		}

		if ( Number.isFinite( nearSrc ) === false || nearSrc <= 0 ) {

			nearSrc = cameraL.near > 0 ? cameraL.near : 0.1;

		}

		let maxZ = - Infinity;
		const sources = [ cameraL, cameraR ];
		const cornerCount = infiniteFar ? 4 : 8;

		for ( let s = 0; s < 2; s ++ ) {

			const src = sources[ s ];

			for ( let i = 0; i < cornerCount; i ++ ) {

				const ndc = _ndcCorners[ i ];
				_corner.set( ndc[ 0 ], ndc[ 1 ], ndc[ 2 ] );
				_corner.applyMatrix4( src.projectionMatrixInverse );
				_corner.applyMatrix4( src.matrixWorld );
				_view.copy( _corner ).applyMatrix4( this.matrixWorldInverse );
				maxZ = Math.max( maxZ, _view.z );

			}

		}

		const zOffset = Math.max( 0, maxZ + nearSrc );

		if ( zOffset > 0 ) {

			this.translateZ( zOffset );
			this.matrixWorld.compose( this.position, this.quaternion, this.scale );
			this.matrixWorldInverse.copy( this.matrixWorld ).invert();

		}

		let minDepth = Infinity;
		let maxDepth = - Infinity;
		let minX = Infinity;
		let maxX = - Infinity;
		let minY = Infinity;
		let maxY = - Infinity;

		for ( let s = 0; s < 2; s ++ ) {

			const src = sources[ s ];
			const origin = s === 0 ? _posL : _posR;

			for ( let i = 0; i < cornerCount; i ++ ) {

				const ndc = _ndcCorners[ i ];
				_corner.set( ndc[ 0 ], ndc[ 1 ], ndc[ 2 ] );
				_corner.applyMatrix4( src.projectionMatrixInverse );
				_corner.applyMatrix4( src.matrixWorld );
				_view.copy( _corner ).applyMatrix4( this.matrixWorldInverse );

				const depth = - _view.z;
				minDepth = Math.min( minDepth, depth );
				maxDepth = Math.max( maxDepth, depth );

				if ( depth > 1e-6 ) {

					const invZ = 1 / depth;
					minX = Math.min( minX, _view.x * invZ );
					maxX = Math.max( maxX, _view.x * invZ );
					minY = Math.min( minY, _view.y * invZ );
					maxY = Math.max( maxY, _view.y * invZ );

				}

			}

			if ( infiniteFar === true ) {

				for ( let i = 0; i < 4; i ++ ) {

					const ndc = _ndcCorners[ i ];
					_corner.set( ndc[ 0 ], ndc[ 1 ], ndc[ 2 ] );
					_corner.applyMatrix4( src.projectionMatrixInverse );
					_corner.applyMatrix4( src.matrixWorld );
					_dir.subVectors( _corner, origin ).transformDirection( this.matrixWorldInverse );

					if ( - _dir.z > 1e-6 ) {

						const invZ = - 1 / _dir.z;
						minX = Math.min( minX, _dir.x * invZ );
						maxX = Math.max( maxX, _dir.x * invZ );
						minY = Math.min( minY, _dir.y * invZ );
						maxY = Math.max( maxY, _dir.y * invZ );

					}

				}

			}

		}

		const near = Math.max( Math.min( minDepth, nearSrc ), 1e-4 );
		const far = infiniteFar ? Infinity : Math.max( maxDepth, near + 1e-4 );
		let left = minX * near;
		let right = maxX * near;
		let bottom = minY * near;
		let top = maxY * near;

		if ( right - left < 1e-6 ) {

			left -= 1e-4;
			right += 1e-4;

		}

		if ( top - bottom < 1e-6 ) {

			bottom -= 1e-4;
			top += 1e-4;

		}

		if ( infiniteFar === true ) {

			const te = this.projectionMatrix.elements;
			const x = 2 * near / ( right - left );
			const y = 2 * near / ( top - bottom );
			const a = ( right + left ) / ( right - left );
			const b = ( top + bottom ) / ( top - bottom );

			te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a;	te[ 12 ] = 0;
			te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b;	te[ 13 ] = 0;
			te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = - 1;	te[ 14 ] = - 2 * near;
			te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;

		} else {

			this.projectionMatrix.makePerspective( left, right, top, bottom, near, far );

		}

		this.projectionMatrixInverse.copy( this.projectionMatrix ).invert();

		return this;

	}

}

export { ArrayCamera };
