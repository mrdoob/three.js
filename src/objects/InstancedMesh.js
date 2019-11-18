/**
 * @author mrdoob / http://mrdoob.com/
 */
import { BufferAttribute } from '../core/BufferAttribute.js';
import { Mesh } from './Mesh.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector2 } from '../math/Vector2.js';
import { Sphere } from '../math/Sphere.js';
import { Ray } from '../math/Ray.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Triangle } from '../math/Triangle.js';
import { Face3 } from '../core/Face3.js';
import { DoubleSide, BackSide } from '../constants.js';

var _inverseMatrix = new Matrix4();
var _ray = new Ray();
var _sphere = new Sphere();

var _vA = new Vector3();
var _vB = new Vector3();
var _vC = new Vector3();

var _uvA = new Vector2();
var _uvB = new Vector2();
var _uvC = new Vector2();

var _intersectionPoint = new Vector3();
var _intersectionPointWorld = new Vector3();

function InstancedMesh( geometry, material, count ) {

	Mesh.call( this, geometry, material );

	this.instanceMatrix = new BufferAttribute( new Float32Array( count * 16 ), 16 );

	this.count = count;

}

InstancedMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {

	constructor: InstancedMesh,

	isInstancedMesh: true,

	raycast: function ( raycaster, intersects ) {

		var geometry = this.geometry;
		var material = this.material;
		var matrixWorld = this.matrixWorld;

		if ( material === undefined ) return;

		for ( var instanceID = 0; instanceID < this.count; instanceID ++ ) {

			//Calculate the world matrix for each instance

			var instanceMatrixWorld = new Matrix4();

			var instanceMatrix = this.getMatrixAt( instanceID );

			instanceMatrixWorld.multiplyMatrices( matrixWorld, instanceMatrix );

			// Checking boundingSphere distance to ray

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			_sphere.copy( geometry.boundingSphere );
			_sphere.applyMatrix4( instanceMatrixWorld );

			if ( raycaster.ray.intersectsSphere( _sphere ) === false ) continue;

			//Transform the ray into the local space of the model

			_inverseMatrix.getInverse( instanceMatrixWorld );
			_ray.copy( raycaster.ray ).applyMatrix4( _inverseMatrix );

			// Check boundingBox before continuing

			if ( geometry.boundingBox !== null ) {

				if ( _ray.intersectsBox( geometry.boundingBox ) === false ) continue;

			}

			var intersection;

			if ( geometry.isBufferGeometry ) {

				var a, b, c;
				var index = geometry.index;
				var position = geometry.attributes.position;
				var uv = geometry.attributes.uv;
				var uv2 = geometry.attributes.uv2;
				var groups = geometry.groups;
				var drawRange = geometry.drawRange;
				var i, j, il, jl;
				var group, groupMaterial;
				var start, end;

				if ( index !== null ) {

					// indexed buffer geometry

					if ( Array.isArray( material ) ) {

						for ( i = 0, il = groups.length; i < il; i ++ ) {

							group = groups[ i ];
							groupMaterial = material[ group.materialIndex ];

							start = Math.max( group.start, drawRange.start );
							end = Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) );

							for ( j = start, jl = end; j < jl; j += 3 ) {

								a = index.getX( j );
								b = index.getX( j + 1 );
								c = index.getX( j + 2 );

								intersection = checkBufferGeometryIntersection( this, instanceMatrixWorld, groupMaterial, raycaster, _ray, position, uv, uv2, a, b, c );

								if ( intersection ) {

									intersection.faceIndex = Math.floor( j / 3 ); // triangle number in indexed buffer semantics
									intersection.face.materialIndex = group.materialIndex;

									intersection.instanceID = instanceID;

									intersects.push( intersection );

								}

							}

						}

					} else {

						start = Math.max( 0, drawRange.start );
						end = Math.min( index.count, ( drawRange.start + drawRange.count ) );

						for ( i = start, il = end; i < il; i += 3 ) {

							a = index.getX( i );
							b = index.getX( i + 1 );
							c = index.getX( i + 2 );

							intersection = checkBufferGeometryIntersection( this, instanceMatrixWorld, material, raycaster, _ray, position, uv, uv2, a, b, c );

							if ( intersection ) {

								intersection.faceIndex = Math.floor( i / 3 ); // triangle number in indexed buffer semantics

								intersection.instanceID = instanceID;

								intersects.push( intersection );

							}

						}

					}

				} else if ( position !== undefined ) {

					// non-indexed buffer geometry

					if ( Array.isArray( material ) ) {

						for ( i = 0, il = groups.length; i < il; i ++ ) {

							group = groups[ i ];
							groupMaterial = material[ group.materialIndex ];

							start = Math.max( group.start, drawRange.start );
							end = Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) );

							for ( j = start, jl = end; j < jl; j += 3 ) {

								a = j;
								b = j + 1;
								c = j + 2;

								intersection = checkBufferGeometryIntersection( this, instanceMatrixWorld, groupMaterial, raycaster, _ray, position, uv, uv2, a, b, c );

								if ( intersection ) {

									intersection.faceIndex = Math.floor( j / 3 ); // triangle number in non-indexed buffer semantics
									intersection.face.materialIndex = group.materialIndex;

									intersection.instanceID = instanceID;

									intersects.push( intersection );

								}

							}

						}

					} else {

						start = Math.max( 0, drawRange.start );
						end = Math.min( position.count, ( drawRange.start + drawRange.count ) );

						for ( i = start, il = end; i < il; i += 3 ) {

							a = i;
							b = i + 1;
							c = i + 2;

							intersection = checkBufferGeometryIntersection( this, instanceMatrixWorld, material, raycaster, _ray, position, uv, uv2, a, b, c );

							if ( intersection ) {

								intersection.faceIndex = Math.floor( i / 3 ); // triangle number in non-indexed buffer semantics

								intersection.instanceID = instanceID;

								intersects.push( intersection );

							}

						}

					}

				}

			}




		}

	},

	getMatrixAt: function ( index ) {

		var matrix = new Matrix4();

		matrix.fromArray( this.instanceMatrix.array, index * 16 );

		return matrix;

	},

	setMatrixAt: function ( index, matrix ) {

		matrix.toArray( this.instanceMatrix.array, index * 16 );

	},

	updateMorphTargets: function () {

	}

} );

function checkIntersection( object, matrixWorld, material, raycaster, ray, pA, pB, pC, point ) {

	var intersect;

	if ( material.side === BackSide ) {

		intersect = ray.intersectTriangle( pC, pB, pA, true, point );

	} else {

		intersect = ray.intersectTriangle( pA, pB, pC, material.side !== DoubleSide, point );

	}

	if ( intersect === null ) return null;

	_intersectionPointWorld.copy( point );
	_intersectionPointWorld.applyMatrix4( matrixWorld );

	var distance = raycaster.ray.origin.distanceTo( _intersectionPointWorld );

	if ( distance < raycaster.near || distance > raycaster.far ) return null;

	return {
		distance: distance,
		point: _intersectionPointWorld.clone(),
		object: object
	};

}

function checkBufferGeometryIntersection( object, matrixWorld, material, raycaster, ray, position, uv, uv2, a, b, c ) {

	_vA.fromBufferAttribute( position, a );
	_vB.fromBufferAttribute( position, b );
	_vC.fromBufferAttribute( position, c );

	var intersection = checkIntersection( object, matrixWorld, material, raycaster, ray, _vA, _vB, _vC, _intersectionPoint );

	if ( intersection ) {

		if ( uv ) {

			_uvA.fromBufferAttribute( uv, a );
			_uvB.fromBufferAttribute( uv, b );
			_uvC.fromBufferAttribute( uv, c );

			intersection.uv = Triangle.getUV( _intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2() );

		}

		if ( uv2 ) {

			_uvA.fromBufferAttribute( uv2, a );
			_uvB.fromBufferAttribute( uv2, b );
			_uvC.fromBufferAttribute( uv2, c );

			intersection.uv2 = Triangle.getUV( _intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2() );

		}

		var face = new Face3( a, b, c );
		Triangle.getNormal( _vA, _vB, _vC, face.normal );

		intersection.face = face;

	}

	return intersection;

}

export { InstancedMesh };
