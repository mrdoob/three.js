import { Vector3 } from '../math/Vector3.js';
import { Vector2 } from '../math/Vector2.js';
import {
	vec3Create, vec3Set, vec3FromBufferAttribute, vec3AddScaledVector, vec3Sub, vec3Add,
	vec3Copy, vec3ApplyMatrix4, vec3DistanceTo, vec3DistanceToSquared, vec3Dot, vec3MultiplyScalar
} from '../math/Vector3Functions.js';
import { sphereCreate, sphereCopy, sphereApplyMatrix4, sphereContainsPoint } from '../math/SphereFunctions.js';
import {
	rayCreate, rayCopy, rayRecast, rayIntersectSphere, rayApplyMatrix4, rayIntersectsBox, rayIntersectTriangle
} from '../math/RayFunctions.js';
import { mat4Create, mat4Copy, mat4Invert } from '../math/Matrix4Functions.js';
import { triangleGetBarycoord, triangleGetInterpolatedAttribute, triangleGetNormal } from '../math/TriangleFunctions.js';
import { frustumIntersectsObject } from '../math/FrustumFunctions.js';
import { Object3D } from '../core/Object3D.js';
import { BackSide, FrontSide } from '../constants.js';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

const _inverseMatrix = /*@__PURE__*/ mat4Create();
const _ray = /*@__PURE__*/ rayCreate();
const _sphere = /*@__PURE__*/ sphereCreate();
const _sphereHitAt = /*@__PURE__*/ vec3Create();

const _vA = /*@__PURE__*/ vec3Create();
const _vB = /*@__PURE__*/ vec3Create();
const _vC = /*@__PURE__*/ vec3Create();

const _tempA = /*@__PURE__*/ vec3Create();
const _morphA = /*@__PURE__*/ vec3Create();

const _intersectionPoint = /*@__PURE__*/ vec3Create();
const _intersectionPointWorld = /*@__PURE__*/ vec3Create();

/**
 * Class representing triangular polygon mesh based objects.
 *
 * ```js
 * const geometry = new THREE.BoxGeometry( 1, 1, 1 );
 * const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
 * const mesh = new THREE.Mesh( geometry, material );
 * scene.add( mesh );
 * ```
 *
 * @augments Object3D
 */
class Mesh extends Object3D {

	/**
	 * Constructs a new mesh.
	 *
	 * @param {BufferGeometry} [geometry] - The mesh geometry.
	 * @param {Material|Array<Material>} [material] - The mesh material.
	 */
	constructor( geometry = new BufferGeometry(), material = new MeshBasicMaterial() ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMesh = true;

		this.type = 'Mesh';

		/**
		 * The mesh geometry.
		 *
		 * @type {BufferGeometry}
		 */
		this.geometry = geometry;

		/**
		 * The mesh material.
		 *
		 * @type {Material|Array<Material>}
		 * @default MeshBasicMaterial
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

		/**
		 * The number of instances of this mesh.
		 * Can only be used with {@link WebGPURenderer}.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.count = 1;

		this.updateMorphTargets();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		if ( source.morphTargetInfluences !== undefined ) {

			this.morphTargetInfluences = source.morphTargetInfluences.slice();

		}

		if ( source.morphTargetDictionary !== undefined ) {

			this.morphTargetDictionary = Object.assign( {}, source.morphTargetDictionary );

		}

		this.material = Array.isArray( source.material ) ? source.material.slice() : source.material;
		this.geometry = source.geometry;

		return this;

	}

	/**
	 * Sets the values of {@link Mesh#morphTargetDictionary} and {@link Mesh#morphTargetInfluences}
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

	/**
	 * Returns the local-space position of the vertex at the given index, taking into
	 * account the current animation state of both morph targets and skinning.
	 *
	 * @param {number} index - The vertex index.
	 * @param {Vector3} target - The target object that is used to store the method's result.
	 * @return {Vector3} The vertex position in local space.
	 */
	getVertexPosition( index, target ) {

		const geometry = this.geometry;
		const position = geometry.attributes.position;
		const morphPosition = geometry.morphAttributes.position;
		const morphTargetsRelative = geometry.morphTargetsRelative;

		vec3FromBufferAttribute( position, index, target );

		const morphInfluences = this.morphTargetInfluences;

		if ( morphPosition && morphInfluences ) {

			vec3Set( _morphA, 0, 0, 0 );

			for ( let i = 0, il = morphPosition.length; i < il; i ++ ) {

				const influence = morphInfluences[ i ];
				const morphAttribute = morphPosition[ i ];

				if ( influence === 0 ) continue;

				vec3FromBufferAttribute( morphAttribute, index, _tempA );

				if ( morphTargetsRelative ) {

					vec3AddScaledVector( _morphA, _tempA, influence, _morphA );

				} else {

					vec3Sub( _tempA, target, _tempA );
					vec3AddScaledVector( _morphA, _tempA, influence, _morphA );

				}

			}

			vec3Add( target, _morphA, target );

		}

		return target;

	}

	/**
	 * Returns `true` if this mesh intersects the given frustum.
	 *
	 * @param {Frustum|FrustumArray} frustum - The frustum to test.
	 * @return {boolean} Whether this mesh intersects the given frustum or not.
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
		const material = this.material;
		const matrixWorld = this.matrixWorld;

		if ( material === undefined ) return;

		// test with bounding sphere in world space

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		sphereCopy( geometry.boundingSphere, _sphere );
		sphereApplyMatrix4( _sphere, matrixWorld, _sphere );

		// check distance from ray origin to bounding sphere

		rayCopy( raycaster.ray, _ray );
		rayRecast( _ray, raycaster.near, _ray );

		if ( sphereContainsPoint( _sphere, _ray.origin ) === false ) {

			if ( rayIntersectSphere( _ray, _sphere, _sphereHitAt ) === null ) return;

			if ( vec3DistanceToSquared( _ray.origin, _sphereHitAt ) > ( raycaster.far - raycaster.near ) ** 2 ) return;

		}

		// convert ray to local space of mesh

		mat4Copy( matrixWorld, _inverseMatrix );
		mat4Invert( _inverseMatrix, _inverseMatrix );
		rayCopy( raycaster.ray, _ray );
		rayApplyMatrix4( _ray, _inverseMatrix, _ray );

		// test with bounding box in local space

		if ( geometry.boundingBox !== null ) {

			if ( rayIntersectsBox( _ray, geometry.boundingBox ) === false ) return;

		}

		// test for intersections with geometry

		this._computeIntersections( raycaster, intersects, _ray );

	}

	_computeIntersections( raycaster, intersects, rayLocalSpace ) {

		let intersection;

		const geometry = this.geometry;
		const material = this.material;

		const index = geometry.index;
		const position = geometry.attributes.position;
		const uv = geometry.attributes.uv;
		const uv1 = geometry.attributes.uv1;
		const normal = geometry.attributes.normal;
		const groups = geometry.groups;
		const drawRange = geometry.drawRange;

		if ( index !== null ) {

			// indexed buffer geometry

			if ( Array.isArray( material ) ) {

				for ( let i = 0, il = groups.length; i < il; i ++ ) {

					const group = groups[ i ];
					const groupMaterial = material[ group.materialIndex ];

					const start = Math.max( group.start, drawRange.start );
					const end = Math.min( index.count, Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) ) );

					for ( let j = start, jl = end; j < jl; j += 3 ) {

						const a = index.getX( j );
						const b = index.getX( j + 1 );
						const c = index.getX( j + 2 );

						intersection = checkGeometryIntersection( this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c );

						if ( intersection ) {

							intersection.faceIndex = Math.floor( j / 3 ); // triangle number in indexed buffer semantics
							intersection.face.materialIndex = group.materialIndex;
							intersects.push( intersection );

						}

					}

				}

			} else {

				const start = Math.max( 0, drawRange.start );
				const end = Math.min( index.count, ( drawRange.start + drawRange.count ) );

				for ( let i = start, il = end; i < il; i += 3 ) {

					const a = index.getX( i );
					const b = index.getX( i + 1 );
					const c = index.getX( i + 2 );

					intersection = checkGeometryIntersection( this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c );

					if ( intersection ) {

						intersection.faceIndex = Math.floor( i / 3 ); // triangle number in indexed buffer semantics
						intersects.push( intersection );

					}

				}

			}

		} else if ( position !== undefined ) {

			// non-indexed buffer geometry

			if ( Array.isArray( material ) ) {

				for ( let i = 0, il = groups.length; i < il; i ++ ) {

					const group = groups[ i ];
					const groupMaterial = material[ group.materialIndex ];

					const start = Math.max( group.start, drawRange.start );
					const end = Math.min( position.count, Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) ) );

					for ( let j = start, jl = end; j < jl; j += 3 ) {

						const a = j;
						const b = j + 1;
						const c = j + 2;

						intersection = checkGeometryIntersection( this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c );

						if ( intersection ) {

							intersection.faceIndex = Math.floor( j / 3 ); // triangle number in non-indexed buffer semantics
							intersection.face.materialIndex = group.materialIndex;
							intersects.push( intersection );

						}

					}

				}

			} else {

				const start = Math.max( 0, drawRange.start );
				const end = Math.min( position.count, ( drawRange.start + drawRange.count ) );

				for ( let i = start, il = end; i < il; i += 3 ) {

					const a = i;
					const b = i + 1;
					const c = i + 2;

					intersection = checkGeometryIntersection( this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c );

					if ( intersection ) {

						intersection.faceIndex = Math.floor( i / 3 ); // triangle number in non-indexed buffer semantics
						intersects.push( intersection );

					}

				}

			}

		}

	}

}

function checkIntersection( object, material, raycaster, ray, pA, pB, pC, point ) {

	let intersect;

	if ( material.side === BackSide ) {

		intersect = rayIntersectTriangle( ray, pC, pB, pA, true, point );

	} else {

		intersect = rayIntersectTriangle( ray, pA, pB, pC, ( material.side === FrontSide ), point );

	}

	if ( intersect === null ) return null;

	vec3Copy( point, _intersectionPointWorld );
	vec3ApplyMatrix4( _intersectionPointWorld, object.matrixWorld, _intersectionPointWorld );

	const distance = vec3DistanceTo( raycaster.ray.origin, _intersectionPointWorld );

	if ( distance < raycaster.near || distance > raycaster.far ) return null;

	return {
		distance: distance,
		point: new Vector3().copy( _intersectionPointWorld ),
		object: object
	};

}

function checkGeometryIntersection( object, material, raycaster, ray, uv, uv1, normal, a, b, c ) {

	object.getVertexPosition( a, _vA );
	object.getVertexPosition( b, _vB );
	object.getVertexPosition( c, _vC );

	const intersection = checkIntersection( object, material, raycaster, ray, _vA, _vB, _vC, _intersectionPoint );

	if ( intersection ) {

		const barycoord = new Vector3();
		triangleGetBarycoord( _intersectionPoint, _vA, _vB, _vC, barycoord );

		if ( uv ) {

			intersection.uv = triangleGetInterpolatedAttribute( uv, a, b, c, barycoord, new Vector2() );

		}

		if ( uv1 ) {

			intersection.uv1 = triangleGetInterpolatedAttribute( uv1, a, b, c, barycoord, new Vector2() );

		}

		if ( normal ) {

			intersection.normal = triangleGetInterpolatedAttribute( normal, a, b, c, barycoord, new Vector3() );

			if ( vec3Dot( intersection.normal, ray.direction ) > 0 ) {

				vec3MultiplyScalar( intersection.normal, - 1, intersection.normal );

			}

		}

		const face = {
			a: a,
			b: b,
			c: c,
			normal: new Vector3(),
			materialIndex: 0
		};

		triangleGetNormal( _vA, _vB, _vC, face.normal );

		intersection.face = face;
		intersection.barycoord = barycoord;

	}

	return intersection;

}

export { Mesh };
