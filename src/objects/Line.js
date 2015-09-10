/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = Line;

var BufferGeometry = require( "../core/BufferGeometry" ),
	Geometry = require( "../core/Geometry" ),
	Object3D = require( "../core/Object3D" ),
	LineBasicMaterial = require( "../materials/LineBasicMaterial" ),
	Matrix4 = require( "../math/Matrix4" ),
	Ray = require( "../math/Ray" ),
	Sphere = require( "../math/Sphere" ),
	Vector3 = require( "../math/Vector3" );

function Line( geometry, material, mode ) {

	if ( mode === 1 ) {

		console.warn( "Line: parameter LinePieces no longer supported." );
		//return new LineSegments( geometry, material );

	}

	Object3D.call( this );

	this.type = "Line";

	this.geometry = geometry !== undefined ? geometry : new Geometry();
	this.material = material !== undefined ? material : new LineBasicMaterial( { color: Math.random() * 0xffffff } );

}

Line.prototype = Object.create( Object3D.prototype );
Line.prototype.constructor = Line;

Line.prototype.raycast = ( function () {

	var inverseMatrix, ray, sphere;

	return function raycast( raycaster, intersects ) {

		// cyclic dependency, caused a short-circuit in the inheritance chain
		// LineSegments <-> Line -x-> Object3D
		var LineSegments = require( "./LineSegments" );

		var precision = raycaster.linePrecision;
		var precisionSq = precision * precision;

		var geometry = this.geometry;

		if ( inverseMatrix === undefined ) { 

			inverseMatrix = new Matrix4();
			ray = new Ray();
			sphere = new Sphere();

		}

		if ( geometry.boundingSphere === null ) { geometry.computeBoundingSphere(); }

		// Checking boundingSphere distance to ray

		sphere.copy( geometry.boundingSphere );
		sphere.applyMatrix4( this.matrixWorld );

		if ( raycaster.ray.isIntersectionSphere( sphere ) === false ) {

			return;

		}

		inverseMatrix.getInverse( this.matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

		var vStart = new Vector3();
		var vEnd = new Vector3();
		var interSegment = new Vector3();
		var interRay = new Vector3();
		var step = this instanceof LineSegments ? 2 : 1;

		var index, attributes,
			indices, positions,
			offsets, oi, offset,
			start, count, i, a, b,
			distSq, distance,
			vertices, nbVertices;

		if ( geometry instanceof BufferGeometry ) {

			index = geometry.index;
			attributes = geometry.attributes;

			if ( index !== null ) {

				indices = index.array;
				positions = attributes.position.array;
				offsets = geometry.groups;

				if ( offsets.length === 0 ) {

					offsets = [ {
						start: 0,
						count: indices.length
					} ];

				}

				for ( oi = 0; oi < offsets.length; oi ++ ) {

					offset = offsets[ oi ];

					start = offset.start;
					count = offset.count;

					for ( i = start; i < start + count - 1; i += step ) {

						a = indices[ i ];
						b = indices[ i + 1 ];

						vStart.fromArray( positions, a * 3 );
						vEnd.fromArray( positions, b * 3 );

						distSq = ray.distanceSqToSegment( vStart, vEnd, interRay, interSegment );

						if ( distSq > precisionSq ) { continue; }

						interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

						distance = raycaster.ray.origin.distanceTo( interRay );

						if ( distance < raycaster.near || distance > raycaster.far ) { continue; }

						intersects.push( {
							distance: distance,
							// What do we want? intersection point on the ray or on the segment??
							// point: raycaster.ray.at( distance ),
							point: interSegment.clone().applyMatrix4( this.matrixWorld ),
							index: i,
							offsetIndex: oi,
							face: null,
							faceIndex: null,
							object: this
						} );

					}

				}

			} else {

				positions = attributes.position.array;

				for ( i = 0; i < positions.length / 3 - 1; i += step ) {

					vStart.fromArray( positions, 3 * i );
					vEnd.fromArray( positions, 3 * i + 3 );

					distSq = ray.distanceSqToSegment( vStart, vEnd, interRay, interSegment );

					if ( distSq > precisionSq ) { continue; }

					interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

					distance = raycaster.ray.origin.distanceTo( interRay );

					if ( distance < raycaster.near || distance > raycaster.far ) { continue; }

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

		} else if ( geometry instanceof Geometry ) {

			vertices = geometry.vertices;
			nbVertices = vertices.length;

			for ( i = 0; i < nbVertices - 1; i += step ) {

				distSq = ray.distanceSqToSegment( vertices[ i ], vertices[ i + 1 ], interRay, interSegment );

				if ( distSq > precisionSq ) { continue; }
				
				interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

				distance = raycaster.ray.origin.distanceTo( interRay );

				if ( distance < raycaster.near || distance > raycaster.far ) { continue; }

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

}() );

Line.prototype.clone = function () {

	return new this.constructor( this.geometry, this.material ).copy( this );

};

Line.prototype.toJSON = function ( meta ) {

	var data = Object3D.prototype.toJSON.call( this, meta );

	// only serialize if not in meta geometries cache
	if ( meta.geometries[ this.geometry.uuid ] === undefined ) {

		meta.geometries[ this.geometry.uuid ] = this.geometry.toJSON();

	}

	// only serialize if not in meta materials cache
	if ( meta.materials[ this.material.uuid ] === undefined ) {

		meta.materials[ this.material.uuid ] = this.material.toJSON();

	}

	data.object.geometry = this.geometry.uuid;
	data.object.material = this.material.uuid;

	return data;

};
