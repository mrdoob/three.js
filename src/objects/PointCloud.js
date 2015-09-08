/**
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = PointCloud;

var BufferGeometry = require( "../core/BufferGeometry" ),
	Geometry = require( "../core/Geometry" ),
	Object3D = require( "../core/Object3D" ),
	PointCloudMaterial = require( "../materials/PointCloudMaterial" ),
	Matrix4 = require( "../math/Matrix4" ),
	Ray = require( "../math/Ray" ),
	Vector3 = require( "../math/Vector3" );

function PointCloud( geometry, material ) {

	Object3D.call( this );

	this.type = "PointCloud";

	this.geometry = geometry !== undefined ? geometry : new Geometry();
	this.material = material !== undefined ? material : new PointCloudMaterial( { color: Math.random() * 0xffffff } );

}

PointCloud.prototype = Object.create( Object3D.prototype );
PointCloud.prototype.constructor = PointCloud;

PointCloud.prototype.raycast = ( function () {

	var inverseMatrix = new Matrix4();
	var ray = new Ray();

	return function raycast( raycaster, intersects ) {

		var object = this;
		var geometry = object.geometry;
		var threshold = raycaster.params.PointCloud.threshold;

		inverseMatrix.getInverse( this.matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

		if ( geometry.boundingBox !== null ) {

			if ( ray.isIntersectionBox( geometry.boundingBox ) === false ) {

				return;

			}

		}

		var localThreshold = threshold / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
		var localThresholdSq = localThreshold * localThreshold;
		var position = new Vector3();
		var rayPointDistanceSq, intersectPoint, distance;

		function testPoint( point, index ) {

			rayPointDistanceSq = ray.distanceSqToPoint( point );

			if ( rayPointDistanceSq < localThresholdSq ) {

				intersectPoint = ray.closestPointToPoint( point );
				intersectPoint.applyMatrix4( object.matrixWorld );

				distance = raycaster.ray.origin.distanceTo( intersectPoint );

				if ( distance < raycaster.near || distance > raycaster.far ) { return; }

				intersects.push( {
					distance: distance,
					distanceToRay: Math.sqrt( rayPointDistanceSq ),
					point: intersectPoint.clone(),
					index: index,
					face: null,
					object: object
				} );

			}

		}

		var i, oi, l, il, ol, a,
			vertices, offset, start, count, index,
			attributes, positions, indices, offsets;

		if ( geometry instanceof BufferGeometry ) {

			index = geometry.index;
			attributes = geometry.attributes;
			positions = attributes.position.array;

			if ( index !== null ) {

				indices = index.array;
				offsets = geometry.groups;

				if ( offsets.length === 0 ) {

					offsets = [ {
						start: 0,
						count: indices.length
					} ];

				}

				for ( oi = 0, ol = offsets.length; oi < ol; ++ oi ) {

					offset = offsets[ oi ];

					start = offset.start;
					count = offset.count;

					for ( i = start, il = start + count; i < il; i ++ ) {

						a = indices[ i ];

						position.fromArray( positions, a * 3 );

						testPoint( position, a );

					}

				}

			} else {

				for ( i = 0, l = positions.length / 3; i < l; i ++ ) {

					position.fromArray( positions, i * 3 );

					testPoint( position, i );

				}

			}

		} else {

			vertices = geometry.vertices;

			for ( i = 0, l = vertices.length; i < l; i ++ ) {

				testPoint( vertices[ i ], i );

			}

		}

	};

}() );

PointCloud.prototype.clone = function () {

	return new this.constructor( this.geometry, this.material ).copy( this );

};

PointCloud.prototype.toJSON = function ( meta ) {

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

// Backwards compatibility

PointCloud.ParticleSystem = function ( geometry, material ) {

	console.warn( "ParticleSystem has been renamed to PointCloud." );
	return new PointCloud( geometry, material );

};
