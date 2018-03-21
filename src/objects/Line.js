import { Sphere } from '../math/Sphere.js';
import { Ray } from '../math/Ray.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { LineSegments } from './LineSegments.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function Line( geometry, material, mode ) {

	if ( mode === 1 ) {

		console.warn( 'THREE.Line: parameter THREE.LinePieces no longer supported. Created THREE.LineSegments instead.' );
		return new LineSegments( geometry, material );

	}

	Object3D.call( this );

	this.type = 'Line';

	this.geometry = geometry !== undefined ? geometry : new BufferGeometry();
	this.material = material !== undefined ? material : new LineBasicMaterial( { color: Math.random() * 0xffffff } );

}

Line.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Line,

	isLine: true,

	computeLineDistances: ( function () {

		var start = new Vector3();
		var end = new Vector3();

		return function computeLineDistances() {

			var geometry = this.geometry;

			if ( geometry.isBufferGeometry ) {

				// we assume non-indexed geometry

				if ( geometry.index === null ) {

					var positionAttribute = geometry.attributes.position;
					var lineDistances = [ 0 ];

					for ( var i = 1, l = positionAttribute.count; i < l; i ++ ) {

						start.fromBufferAttribute( positionAttribute, i - 1 );
						end.fromBufferAttribute( positionAttribute, i );

						lineDistances[ i ] = lineDistances[ i - 1 ];
						lineDistances[ i ] += start.distanceTo( end );

					}

					geometry.addAttribute( 'lineDistance', new THREE.Float32BufferAttribute( lineDistances, 1 ) );

				} else {

					console.warn( 'THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.' );

				}

			} else if ( geometry.isGeometry ) {

				var vertices = geometry.vertices;
				var lineDistances = geometry.lineDistances;

				lineDistances[ 0 ] = 0;

				for ( var i = 1, l = vertices.length; i < l; i ++ ) {

					lineDistances[ i ] = lineDistances[ i - 1 ];
					lineDistances[ i ] += vertices[ i - 1 ].distanceTo( vertices[ i ] );

				}

			}

			return this;

		};

	}() ),

	raycast: ( function () {

		var inverseMatrix = new Matrix4();
		var ray = new Ray();
		var sphere = new Sphere();

		return function raycast( raycaster, intersects ) {

			var precision = raycaster.linePrecision;
			var precisionSq = precision * precision;

			var geometry = this.geometry;
			var matrixWorld = this.matrixWorld;

			// Checking boundingSphere distance to ray

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			sphere.copy( geometry.boundingSphere );
			sphere.applyMatrix4( matrixWorld );

			if ( raycaster.ray.intersectsSphere( sphere ) === false ) return;

			//

			inverseMatrix.getInverse( matrixWorld );
			ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

			var vStart = new Vector3();
			var vEnd = new Vector3();
			var interSegment = new Vector3();
			var interRay = new Vector3();
			var step = ( this && this.isLineSegments ) ? 2 : 1;

			if ( geometry.isBufferGeometry ) {

				var index = geometry.index;
				var attributes = geometry.attributes;
				var positions = attributes.position.array;

				if ( index !== null ) {

					var indices = index.array;

					for ( var i = 0, l = indices.length - 1; i < l; i += step ) {

						var a = indices[ i ];
						var b = indices[ i + 1 ];

						vStart.fromArray( positions, a * 3 );
						vEnd.fromArray( positions, b * 3 );

						var distSq = ray.distanceSqToSegment( vStart, vEnd, interRay, interSegment );

						if ( distSq > precisionSq ) continue;

						interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

						var distance = raycaster.ray.origin.distanceTo( interRay );

						if ( distance < raycaster.near || distance > raycaster.far ) continue;

						intersects.push( {

							distance: distance,
							// What do we want? intersection point on the ray or on the segment??
							// point: raycaster.ray.at( distance ),
							point: interSegment.clone().applyMatrix4( this.matrixWorld ),
							index: i,
							face: null,
							faceIndex: null,
							object: this

						} );

					}

				} else {

					for ( var i = 0, l = positions.length / 3 - 1; i < l; i += step ) {

						vStart.fromArray( positions, 3 * i );
						vEnd.fromArray( positions, 3 * i + 3 );

						var distSq = ray.distanceSqToSegment( vStart, vEnd, interRay, interSegment );

						if ( distSq > precisionSq ) continue;

						interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

						var distance = raycaster.ray.origin.distanceTo( interRay );

						if ( distance < raycaster.near || distance > raycaster.far ) continue;

						intersects.push( {

							distance: distance,
							// What do we want? intersection point on the ray or on the segment??
							// point: raycaster.ray.at( distance ),
							point: interSegment.clone().applyMatrix4( this.matrixWorld ),
							index: i,
							face: null,
							faceIndex: null,
							object: this

						} );

					}

				}

			} else if ( geometry.isGeometry ) {

				var vertices = geometry.vertices;
				var nbVertices = vertices.length;

				for ( var i = 0; i < nbVertices - 1; i += step ) {

					var distSq = ray.distanceSqToSegment( vertices[ i ], vertices[ i + 1 ], interRay, interSegment );

					if ( distSq > precisionSq ) continue;

					interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

					var distance = raycaster.ray.origin.distanceTo( interRay );

					if ( distance < raycaster.near || distance > raycaster.far ) continue;

					intersects.push( {

						distance: distance,
						// What do we want? intersection point on the ray or on the segment??
						// point: raycaster.ray.at( distance ),
						point: interSegment.clone().applyMatrix4( this.matrixWorld ),
						index: i,
						face: null,
						faceIndex: null,
						object: this

					} );

				}

			}

		};

	}() ),

	clone: function () {

		return new this.constructor( this.geometry, this.material ).copy( this );

	}

} );


export { Line };
