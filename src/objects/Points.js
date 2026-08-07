import { sphereCreate, sphereCopy, sphereApplyMatrix4 } from '../math/SphereFunctions.js';
import { rayCreate, rayCopy, rayApplyMatrix4, rayIntersectsSphere, rayDistanceSqToPoint, rayClosestPointToPoint } from '../math/RayFunctions.js';
import { mat4Create, mat4Copy, mat4Invert } from '../math/Matrix4Functions.js';
import { frustumIntersectsObject } from '../math/FrustumFunctions.js';
import { Object3D } from '../core/Object3D.js';
import { vec3Create, vec3FromBufferAttribute, vec3ApplyMatrix4, vec3DistanceTo } from '../math/Vector3Functions.js';
import { Vector3 } from '../math/Vector3.js';
import { PointsMaterial } from '../materials/PointsMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

const _inverseMatrix = /*@__PURE__*/ mat4Create();
const _ray = /*@__PURE__*/ rayCreate();
const _sphere = /*@__PURE__*/ sphereCreate();
const _position = /*@__PURE__*/ vec3Create();

/**
 * A class for displaying points or point clouds.
 *
 * @augments Object3D
 */
class Points extends Object3D {

	/**
	 * Constructs a new point cloud.
	 *
	 * @param {BufferGeometry} [geometry] - The points geometry.
	 * @param {Material|Array<Material>} [material] - The points material.
	 */
	constructor( geometry = new BufferGeometry(), material = new PointsMaterial() ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPoints = true;

		this.type = 'Points';

		/**
		 * The points geometry.
		 *
		 * @type {BufferGeometry}
		 */
		this.geometry = geometry;

		/**
		 * The line material.
		 *
		 * @type {Material|Array<Material>}
		 * @default PointsMaterial
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
	 * Returns `true` if this point cloud intersects the given frustum.
	 *
	 * @param {Frustum|FrustumArray} frustum - The frustum to test.
	 * @return {boolean} Whether this point cloud intersects the given frustum or not.
	 */
	intersectsFrustum( frustum ) {

		return frustum.planes !== undefined ? frustumIntersectsObject( frustum, this ) : frustum.intersectsObject( this );

	}

	/**
	 * Computes intersection points between a casted ray and this point cloud.
	 *
	 * @param {Raycaster} raycaster - The raycaster.
	 * @param {Array<Object>} intersects - The target array that holds the intersection points.
	 */
	raycast( raycaster, intersects ) {

		const geometry = this.geometry;
		const matrixWorld = this.matrixWorld;
		const threshold = raycaster.params.Points.threshold;
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

		const index = geometry.index;
		const attributes = geometry.attributes;
		const positionAttribute = attributes.position;

		if ( index !== null ) {

			const start = Math.max( 0, drawRange.start );
			const end = Math.min( index.count, ( drawRange.start + drawRange.count ) );

			for ( let i = start, il = end; i < il; i ++ ) {

				const a = index.getX( i );

				vec3FromBufferAttribute( positionAttribute, a, _position );

				testPoint( _position, a, localThresholdSq, matrixWorld, raycaster, intersects, this );

			}

		} else {

			const start = Math.max( 0, drawRange.start );
			const end = Math.min( positionAttribute.count, ( drawRange.start + drawRange.count ) );

			for ( let i = start, l = end; i < l; i ++ ) {

				vec3FromBufferAttribute( positionAttribute, i, _position );

				testPoint( _position, i, localThresholdSq, matrixWorld, raycaster, intersects, this );

			}

		}

	}

	/**
	 * Sets the values of {@link Points#morphTargetDictionary} and {@link Points#morphTargetInfluences}
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

function testPoint( point, index, localThresholdSq, matrixWorld, raycaster, intersects, object ) {

	const rayPointDistanceSq = rayDistanceSqToPoint( _ray, point );

	if ( rayPointDistanceSq < localThresholdSq ) {

		const intersectPoint = new Vector3();

		rayClosestPointToPoint( _ray, point, intersectPoint );
		vec3ApplyMatrix4( intersectPoint, matrixWorld, intersectPoint );

		const distance = vec3DistanceTo( raycaster.ray.origin, intersectPoint );

		if ( distance < raycaster.near || distance > raycaster.far ) return;

		intersects.push( {

			distance: distance,
			distanceToRay: Math.sqrt( rayPointDistanceSq ),
			point: intersectPoint,
			index: index,
			face: null,
			faceIndex: null,
			barycoord: null,
			object: object

		} );

	}

}

export { Points };
