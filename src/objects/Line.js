import { sphereCreate, sphereCopy, sphereApplyMatrix4 } from '../math/SphereFunctions.js';
import { rayCreate, rayCopy, rayApplyMatrix4, rayIntersectsSphere, rayDistanceSqToSegment } from '../math/RayFunctions.js';
import { mat4Create, mat4Copy, mat4Invert } from '../math/Matrix4Functions.js';
import { frustumIntersectsObject } from '../math/FrustumFunctions.js';
import { Object3D } from '../core/Object3D.js';
import {
	vec3Create, vec3FromBufferAttribute, vec3DistanceTo, vec3ApplyMatrix4, vec3Copy
} from '../math/Vector3Functions.js';
import { Vector3 } from '../math/Vector3.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { warn } from '../utils.js';

const _vStart = /*@__PURE__*/ vec3Create();
const _vEnd = /*@__PURE__*/ vec3Create();

const _inverseMatrix = /*@__PURE__*/ mat4Create();
const _ray = /*@__PURE__*/ rayCreate();
const _sphere = /*@__PURE__*/ sphereCreate();

const _intersectPointOnRay = /*@__PURE__*/ vec3Create();
const _intersectPointOnSegment = /*@__PURE__*/ vec3Create();

/**
 * A continuous line. The line are rendered by connecting consecutive
 * vertices with straight lines.
 *
 * ```js
 * const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
 *
 * const points = [];
 * points.push( new THREE.Vector3( - 10, 0, 0 ) );
 * points.push( new THREE.Vector3( 0, 10, 0 ) );
 * points.push( new THREE.Vector3( 10, 0, 0 ) );
 *
 * const geometry = new THREE.BufferGeometry().setFromPoints( points );
 *
 * const line = new THREE.Line( geometry, material );
 * scene.add( line );
 * ```
 *
 * @augments Object3D
 */
class Line extends Object3D {

	/**
	 * Constructs a new line.
	 *
	 * @param {BufferGeometry} [geometry] - The line geometry.
	 * @param {Material|Array<Material>} [material] - The line material.
	 */
	constructor( geometry = new BufferGeometry(), material = new LineBasicMaterial() ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLine = true;

		this.type = 'Line';

		/**
		 * The line geometry.
		 *
		 * @type {BufferGeometry}
		 */
		this.geometry = geometry;

		/**
		 * The line material.
		 *
		 * @type {Material|Array<Material>}
		 * @default LineBasicMaterial
		 */
		this.material = material;

		/**
		 * A dictionary representing the morph targets in the geometry. The key is the
		 * morph targets name, the value its attribute index. This member is `undefined`
		 * by default and only set when morph targets are detected in the geometry.
		 *
		 * @type {Object<string,number>|undefined}
		 * @default undefined
		 */
		this.morphTargetDictionary = undefined;

		/**
		 * An array of weights typically in the range `[0,1]` that specify how much of the morph
		 * is applied. This member is `undefined` by default and only set when morph targets are
		 * detected in the geometry.
		 *
		 * @type {Array<number>|undefined}
		 * @default undefined
		 */
		this.morphTargetInfluences = undefined;

		this.updateMorphTargets();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.material = Array.isArray( source.material ) ? source.material.slice() : source.material;
		this.geometry = source.geometry;

		return this;

	}

	/**
	 * Computes an array of distance values which are necessary for rendering dashed lines.
	 * For each vertex in the geometry, the method calculates the cumulative length from the
	 * current point to the very beginning of the line.
	 *
	 * @return {Line} A reference to this line.
	 */
	computeLineDistances() {

		const geometry = this.geometry;

		// we assume non-indexed geometry

		if ( geometry.index === null ) {

			const positionAttribute = geometry.attributes.position;
			const lineDistances = [ 0 ];

			for ( let i = 1, l = positionAttribute.count; i < l; i ++ ) {

				vec3FromBufferAttribute( positionAttribute, i - 1, _vStart );
				vec3FromBufferAttribute( positionAttribute, i, _vEnd );

				lineDistances[ i ] = lineDistances[ i - 1 ];
				lineDistances[ i ] += vec3DistanceTo( _vStart, _vEnd );

			}

			geometry.setAttribute( 'lineDistance', new Float32BufferAttribute( lineDistances, 1 ) );

		} else {

			warn( 'Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.' );

		}

		return this;

	}

	/**
	 * Returns `true` if this line intersects the given frustum.
	 *
	 * @param {Frustum|FrustumArray} frustum - The frustum to test.
	 * @return {boolean} Whether this line intersects the given frustum or not.
	 */
	intersectsFrustum( frustum ) {

		return frustum.planes !== undefined ? frustumIntersectsObject( frustum, this ) : frustum.intersectsObject( this );

	}

	/**
	 * Computes intersection points between a casted ray and this line.
	 *
	 * @param {Raycaster} raycaster - The raycaster.
	 * @param {Array<Object>} intersects - The target array that holds the intersection points.
	 */
	raycast( raycaster, intersects ) {

		const geometry = this.geometry;
		const matrixWorld = this.matrixWorld;
		const threshold = raycaster.params.Line.threshold;
		const drawRange = geometry.drawRange;

		// Checking boundingSphere distance to ray

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		sphereCopy( geometry.boundingSphere, _sphere );
		sphereApplyMatrix4( _sphere, matrixWorld, _sphere );
		_sphere.radius += threshold;

		if ( rayIntersectsSphere( raycaster.ray, _sphere ) === false ) return;

		//

		mat4Copy( matrixWorld, _inverseMatrix );
		mat4Invert( _inverseMatrix, _inverseMatrix );
		rayCopy( raycaster.ray, _ray );
		rayApplyMatrix4( _ray, _inverseMatrix, _ray );

		const localThreshold = threshold / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
		const localThresholdSq = localThreshold * localThreshold;

		const step = this.isLineSegments ? 2 : 1;

		const index = geometry.index;
		const attributes = geometry.attributes;
		const positionAttribute = attributes.position;

		if ( index !== null ) {

			const start = Math.max( 0, drawRange.start );
			const end = Math.min( index.count, ( drawRange.start + drawRange.count ) );

			for ( let i = start, l = end - 1; i < l; i += step ) {

				const a = index.getX( i );
				const b = index.getX( i + 1 );

				const intersect = checkIntersection( this, raycaster, _ray, localThresholdSq, a, b, i );

				if ( intersect ) {

					intersects.push( intersect );

				}

			}

			if ( this.isLineLoop ) {

				const a = index.getX( end - 1 );
				const b = index.getX( start );

				const intersect = checkIntersection( this, raycaster, _ray, localThresholdSq, a, b, end - 1 );

				if ( intersect ) {

					intersects.push( intersect );

				}

			}

		} else {

			const start = Math.max( 0, drawRange.start );
			const end = Math.min( positionAttribute.count, ( drawRange.start + drawRange.count ) );

			for ( let i = start, l = end - 1; i < l; i += step ) {

				const intersect = checkIntersection( this, raycaster, _ray, localThresholdSq, i, i + 1, i );

				if ( intersect ) {

					intersects.push( intersect );

				}

			}

			if ( this.isLineLoop ) {

				const intersect = checkIntersection( this, raycaster, _ray, localThresholdSq, end - 1, start, end - 1 );

				if ( intersect ) {

					intersects.push( intersect );

				}

			}

		}

	}

	/**
	 * Sets the values of {@link Line#morphTargetDictionary} and {@link Line#morphTargetInfluences}
	 * to make sure existing morph targets can influence this 3D object.
	 */
	updateMorphTargets() {

		const geometry = this.geometry;

		const morphAttributes = geometry.morphAttributes;
		const keys = Object.keys( morphAttributes );

		if ( keys.length > 0 ) {

			const morphAttribute = morphAttributes[ keys[ 0 ] ];

			if ( morphAttribute !== undefined ) {

				this.morphTargetInfluences = [];
				this.morphTargetDictionary = {};

				for ( let m = 0, ml = morphAttribute.length; m < ml; m ++ ) {

					const name = morphAttribute[ m ].name || String( m );

					this.morphTargetInfluences.push( 0 );
					this.morphTargetDictionary[ name ] = m;

				}

			}

		}

	}

}

function checkIntersection( object, raycaster, ray, thresholdSq, a, b, i ) {

	const positionAttribute = object.geometry.attributes.position;

	vec3FromBufferAttribute( positionAttribute, a, _vStart );
	vec3FromBufferAttribute( positionAttribute, b, _vEnd );

	const distSq = rayDistanceSqToSegment( ray, _vStart, _vEnd, _intersectPointOnRay, _intersectPointOnSegment );

	if ( distSq > thresholdSq ) return;

	vec3ApplyMatrix4( _intersectPointOnRay, object.matrixWorld, _intersectPointOnRay ); // Move back to world space for distance calculation

	const distance = vec3DistanceTo( raycaster.ray.origin, _intersectPointOnRay );

	if ( distance < raycaster.near || distance > raycaster.far ) return;

	const point = new Vector3();
	vec3Copy( _intersectPointOnSegment, point );
	vec3ApplyMatrix4( point, object.matrixWorld, point );

	return {

		distance: distance,
		// What do we want? intersection point on the ray or on the segment??
		// point: raycaster.ray.at( distance ),
		point: point,
		index: i,
		face: null,
		faceIndex: null,
		barycoord: null,
		object: object

	};

}

export { Line };
