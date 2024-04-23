import { Vector3 } from '../math/Vector3.js';
import { Vector2 } from '../math/Vector2.js';
import { Sphere } from '../math/Sphere.js';
import { Ray } from '../math/Ray.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { Triangle } from '../math/Triangle.js';
import { BackSide, FrontSide } from '../constants.js';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

const _inverseMatrix = /*@__PURE__*/ new Matrix4();
const _ray = /*@__PURE__*/ new Ray();
const _sphere = /*@__PURE__*/ new Sphere();
const _sphereHitAt = /*@__PURE__*/ new Vector3();

const _vA = /*@__PURE__*/ new Vector3();
const _vB = /*@__PURE__*/ new Vector3();
const _vC = /*@__PURE__*/ new Vector3();

const _tempA = /*@__PURE__*/ new Vector3();
const _morphA = /*@__PURE__*/ new Vector3();

const _uvA = /*@__PURE__*/ new Vector2();
const _uvB = /*@__PURE__*/ new Vector2();
const _uvC = /*@__PURE__*/ new Vector2();

const _normalA = /*@__PURE__*/ new Vector3();
const _normalB = /*@__PURE__*/ new Vector3();
const _normalC = /*@__PURE__*/ new Vector3();

const _intersectionPoint = /*@__PURE__*/ new Vector3();
const _intersectionPointWorld = /*@__PURE__*/ new Vector3();

class Mesh extends Object3D {

	constructor( geometry = new BufferGeometry(), material = new MeshBasicMaterial() ) {

		super();

		this.isMesh = true;

		this.type = 'Mesh';

		this.geometry = geometry;
		this.material = material;

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

	getVertexPosition( index, target ) {

		const geometry = this.geometry;
		const position = geometry.attributes.position;
		const morphPosition = geometry.morphAttributes.position;
		const morphTargetsRelative = geometry.morphTargetsRelative;

		target.fromBufferAttribute( position, index );

		const morphInfluences = this.morphTargetInfluences;

		if ( morphPosition && morphInfluences ) {

			_morphA.set( 0, 0, 0 );

			for ( let i = 0, il = morphPosition.length; i < il; i ++ ) {

				const influence = morphInfluences[ i ];
				const morphAttribute = morphPosition[ i ];

				if ( influence === 0 ) continue;

				_tempA.fromBufferAttribute( morphAttribute, index );

				if ( morphTargetsRelative ) {

					_morphA.addScaledVector( _tempA, influence );

				} else {

					_morphA.addScaledVector( _tempA.sub( target ), influence );

				}

			}

			target.add( _morphA );

		}

		return target;

	}

	raycast( raycaster, intersects ) {

		const geometry = this.geometry;
		const material = this.material;
		const matrixWorld = this.matrixWorld;

		if ( material === undefined ) return;

		// test with bounding sphere in world space

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		_sphere.copy( geometry.boundingSphere );
		_sphere.applyMatrix4( matrixWorld );

		// check distance from ray origin to bounding sphere

		_ray.copy( raycaster.ray ).recast( raycaster.near );

		if ( _sphere.containsPoint( _ray.origin ) === false ) {

			if ( _ray.intersectSphere( _sphere, _sphereHitAt ) === null ) return;

			if ( _ray.origin.distanceToSquared( _sphereHitAt ) > ( raycaster.far - raycaster.near ) ** 2 ) return;

		}

		// convert ray to local space of mesh

		_inverseMatrix.copy( matrixWorld ).invert();
		_ray.copy( raycaster.ray ).applyMatrix4( _inverseMatrix );

		// test with bounding box in local space

		if ( geometry.boundingBox !== null ) {

			if ( _ray.intersectsBox( geometry.boundingBox ) === false ) return;

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

		intersect = ray.intersectTriangle( pC, pB, pA, true, point );

	} else {

		intersect = ray.intersectTriangle( pA, pB, pC, ( material.side === FrontSide ), point );

	}

	if ( intersect === null ) return null;

	_intersectionPointWorld.copy( point );
	_intersectionPointWorld.applyMatrix4( object.matrixWorld );

	const distance = raycaster.ray.origin.distanceTo( _intersectionPointWorld );

	if ( distance < raycaster.near || distance > raycaster.far ) return null;

	return {
		distance: distance,
		point: _intersectionPointWorld.clone(),
		object: object
	};

}

function checkGeometryIntersection( object, material, raycaster, ray, uv, uv1, normal, a, b, c ) {

	object.getVertexPosition( a, _vA );
	object.getVertexPosition( b, _vB );
	object.getVertexPosition( c, _vC );

	const intersection = checkIntersection( object, material, raycaster, ray, _vA, _vB, _vC, _intersectionPoint );

	if ( intersection ) {

		if ( uv ) {

			_uvA.fromBufferAttribute( uv, a );
			_uvB.fromBufferAttribute( uv, b );
			_uvC.fromBufferAttribute( uv, c );

			intersection.uv = Triangle.getInterpolation( _intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2() );

		}

		if ( uv1 ) {

			_uvA.fromBufferAttribute( uv1, a );
			_uvB.fromBufferAttribute( uv1, b );
			_uvC.fromBufferAttribute( uv1, c );

			intersection.uv1 = Triangle.getInterpolation( _intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2() );

		}

		if ( normal ) {

			_normalA.fromBufferAttribute( normal, a );
			_normalB.fromBufferAttribute( normal, b );
			_normalC.fromBufferAttribute( normal, c );

			intersection.normal = Triangle.getInterpolation( _intersectionPoint, _vA, _vB, _vC, _normalA, _normalB, _normalC, new Vector3() );

			if ( intersection.normal.dot( ray.direction ) > 0 ) {

				intersection.normal.multiplyScalar( - 1 );

			}

		}

		const face = {
			a: a,
			b: b,
			c: c,
			normal: new Vector3(),
			materialIndex: 0
		};

		Triangle.getNormal( _vA, _vB, _vC, face.normal );

		intersection.face = face;

	}

	return intersection;

}

export { Mesh };
