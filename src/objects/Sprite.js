import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import {
	vec2Create, vec2Set, vec2SubVectors, vec2AddScalar, vec2Multiply, vec2Copy
} from '../math/Vector2Functions.js';
import {
	vec3Create, vec3Set, vec3SetFromMatrixScale, vec3SetFromMatrixPosition,
	vec3MultiplyScalar, vec3Copy, vec3ApplyMatrix4, vec3DistanceTo
} from '../math/Vector3Functions.js';
import { mat4Create, mat4Copy, mat4MultiplyMatrices } from '../math/Matrix4Functions.js';
import { triangleGetInterpolation } from '../math/TriangleFunctions.js';
import { rayIntersectTriangle } from '../math/RayFunctions.js';
import { frustumIntersectsSprite } from '../math/FrustumFunctions.js';
import { Object3D } from '../core/Object3D.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { InterleavedBuffer } from '../core/InterleavedBuffer.js';
import { InterleavedBufferAttribute } from '../core/InterleavedBufferAttribute.js';
import { SpriteMaterial } from '../materials/SpriteMaterial.js';
import { error } from '../utils.js';

let _geometry;

const _intersectPoint = /*@__PURE__*/ vec3Create();
const _worldScale = /*@__PURE__*/ vec3Create();
const _mvPosition = /*@__PURE__*/ vec3Create();

const _alignedPosition = /*@__PURE__*/ vec2Create();
const _rotatedPosition = /*@__PURE__*/ vec2Create();
const _viewWorldMatrix = /*@__PURE__*/ mat4Create();

const _vA = /*@__PURE__*/ vec3Create();
const _vB = /*@__PURE__*/ vec3Create();
const _vC = /*@__PURE__*/ vec3Create();

const _uvA = /*@__PURE__*/ vec2Create();
const _uvB = /*@__PURE__*/ vec2Create();
const _uvC = /*@__PURE__*/ vec2Create();

/**
 * A sprite is a plane that always faces towards the camera, generally with a
 * partially transparent texture applied.
 *
 * Sprites do not cast shadows, setting {@link Object3D#castShadow} to `true` will
 * have no effect.
 *
 * ```js
 * const map = new THREE.TextureLoader().load( 'sprite.png' );
 * const material = new THREE.SpriteMaterial( { map: map } );
 *
 * const sprite = new THREE.Sprite( material );
 * scene.add( sprite );
 * ```
 *
 * @augments Object3D
 */
class Sprite extends Object3D {

	/**
	 * Constructs a new sprite.
	 *
	 * @param {(SpriteMaterial|SpriteNodeMaterial)} [material] - The sprite material.
	 */
	constructor( material = new SpriteMaterial() ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSprite = true;

		this.type = 'Sprite';

		if ( _geometry === undefined ) {

			_geometry = new BufferGeometry();

			const float32Array = new Float32Array( [
				- 0.5, - 0.5, 0, 0, 0,
				0.5, - 0.5, 0, 1, 0,
				0.5, 0.5, 0, 1, 1,
				- 0.5, 0.5, 0, 0, 1
			] );

			const interleavedBuffer = new InterleavedBuffer( float32Array, 5 );

			_geometry.setIndex( [ 0, 1, 2,	0, 2, 3 ] );
			_geometry.setAttribute( 'position', new InterleavedBufferAttribute( interleavedBuffer, 3, 0, false ) );
			_geometry.setAttribute( 'uv', new InterleavedBufferAttribute( interleavedBuffer, 2, 3, false ) );

		}

		/**
		 * The sprite geometry.
		 *
		 * @type {BufferGeometry}
		 */
		this.geometry = _geometry;

		/**
		 * The sprite material.
		 *
		 * @type {(SpriteMaterial|SpriteNodeMaterial)}
		 */
		this.material = material;

		/**
		 * The sprite's anchor point, and the point around which the sprite rotates.
		 * A value of `(0.5, 0.5)` corresponds to the midpoint of the sprite. A value
		 * of `(0, 0)` corresponds to the lower left corner of the sprite.
		 *
		 * @type {Vector2}
		 * @default (0.5,0.5)
		 */
		this.center = new Vector2( 0.5, 0.5 );

		/**
		 * The number of instances of this sprite.
		 * Can only be used with {@link WebGPURenderer}.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.count = 1;

	}

	/**
	 * Returns `true` if this sprite intersects the given frustum.
	 *
	 * @param {Frustum|FrustumArray} frustum - The frustum to test.
	 * @return {boolean} Whether this sprite intersects the given frustum or not.
	 */
	intersectsFrustum( frustum ) {

		return frustum.planes !== undefined ? frustumIntersectsSprite( frustum, this ) : frustum.intersectsSprite( this );

	}

	/**
	 * Computes intersection points between a casted ray and this sprite.
	 *
	 * @param {Raycaster} raycaster - The raycaster.
	 * @param {Array<Object>} intersects - The target array that holds the intersection points.
	 */
	raycast( raycaster, intersects ) {

		if ( raycaster.camera === null ) {

			error( 'Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.' );

		}

		vec3SetFromMatrixScale( this.matrixWorld, _worldScale );

		mat4Copy( raycaster.camera.matrixWorld, _viewWorldMatrix );
		mat4MultiplyMatrices( raycaster.camera.matrixWorldInverse, this.matrixWorld, this.modelViewMatrix );

		vec3SetFromMatrixPosition( this.modelViewMatrix, _mvPosition );

		if ( raycaster.camera.isPerspectiveCamera && this.material.sizeAttenuation === false ) {

			vec3MultiplyScalar( _worldScale, - _mvPosition.z, _worldScale );

		}

		const rotation = this.material.rotation;
		let sin, cos;

		if ( rotation !== 0 ) {

			cos = Math.cos( rotation );
			sin = Math.sin( rotation );

		}

		const center = this.center;

		vec3Set( _vA, - 0.5, - 0.5, 0 );
		transformVertex( _vA, _mvPosition, center, _worldScale, sin, cos );
		vec3Set( _vB, 0.5, - 0.5, 0 );
		transformVertex( _vB, _mvPosition, center, _worldScale, sin, cos );
		vec3Set( _vC, 0.5, 0.5, 0 );
		transformVertex( _vC, _mvPosition, center, _worldScale, sin, cos );

		vec2Set( 0, 0, _uvA );
		vec2Set( 1, 0, _uvB );
		vec2Set( 1, 1, _uvC );

		// check first triangle
		let intersect = rayIntersectTriangle( raycaster.ray, _vA, _vB, _vC, false, _intersectPoint );

		if ( intersect === null ) {

			// check second triangle
			vec3Set( _vB, - 0.5, 0.5, 0 );
			transformVertex( _vB, _mvPosition, center, _worldScale, sin, cos );
			vec2Set( 0, 1, _uvB );

			intersect = rayIntersectTriangle( raycaster.ray, _vA, _vC, _vB, false, _intersectPoint );
			if ( intersect === null ) {

				return;

			}

		}

		const distance = vec3DistanceTo( raycaster.ray.origin, _intersectPoint );

		if ( distance < raycaster.near || distance > raycaster.far ) return;

		intersects.push( {

			distance: distance,
			point: new Vector3().copy( _intersectPoint ),
			uv: triangleGetInterpolation( _intersectPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2() ),
			face: null,
			object: this

		} );

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		if ( source.center !== undefined ) this.center.copy( source.center );

		this.material = source.material;

		return this;

	}

}

function transformVertex( vertexPosition, mvPosition, center, scale, sin, cos ) {

	// compute position in camera space
	vec2SubVectors( vertexPosition, center, _alignedPosition );
	vec2AddScalar( _alignedPosition, 0.5, _alignedPosition );
	vec2Multiply( _alignedPosition, scale, _alignedPosition );

	// to check if rotation is not zero
	if ( sin !== undefined ) {

		_rotatedPosition.x = ( cos * _alignedPosition.x ) - ( sin * _alignedPosition.y );
		_rotatedPosition.y = ( sin * _alignedPosition.x ) + ( cos * _alignedPosition.y );

	} else {

		vec2Copy( _alignedPosition, _rotatedPosition );

	}


	vec3Copy( mvPosition, vertexPosition );
	vertexPosition.x += _rotatedPosition.x;
	vertexPosition.y += _rotatedPosition.y;

	// transform to world space
	vec3ApplyMatrix4( vertexPosition, _viewWorldMatrix, vertexPosition );

}

export { Sprite };
