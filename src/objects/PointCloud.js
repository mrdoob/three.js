/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.PointCloud = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.type = 'PointCloud';

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.PointCloudMaterial( { color: Math.random() * 0xffffff } );

};

THREE.PointCloud.prototype = Object.create( THREE.Object3D.prototype );
THREE.PointCloud.prototype.constructor = THREE.PointCloud;

THREE.PointCloud.prototype.raycast = ( function () {

	var inverseMatrix = new THREE.Matrix4();
	var ray = new THREE.Ray();

	return function ( raycaster, intersects ) {

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
		var position = new THREE.Vector3();

		var testPoint = function ( point, index ) {

			var rayPointDistance = ray.distanceToPoint( point );

			if ( rayPointDistance < localThreshold ) {

				var intersectPoint = ray.closestPointToPoint( point );
				intersectPoint.applyMatrix4( object.matrixWorld );

				var distance = raycaster.ray.origin.distanceTo( intersectPoint );

				if ( distance < raycaster.near || distance > raycaster.far ) return;

				intersects.push( {

					distance: distance,
					distanceToRay: rayPointDistance,
					point: intersectPoint.clone(),
					index: index,
					face: null,
					object: object

				} );

			}

		};

		if ( geometry instanceof THREE.BufferGeometry ) {

			var attributes = geometry.attributes;
			var positions = attributes.position.array;

			if ( attributes.index !== undefined ) {

				var indices = attributes.index.array;
				var offsets = geometry.offsets;

				if ( offsets.length === 0 ) {

					var offset = {
						start: 0,
						count: indices.length,
						index: 0
					};

					offsets = [ offset ];

				}

				for ( var oi = 0, ol = offsets.length; oi < ol; ++ oi ) {

					var start = offsets[ oi ].start;
					var count = offsets[ oi ].count;
					var index = offsets[ oi ].index;

					for ( var i = start, il = start + count; i < il; i ++ ) {

						var a = index + indices[ i ];

						position.fromArray( positions, a * 3 );

						testPoint( position, a );

					}

				}

			} else {

				var pointCount = positions.length / 3;

				for ( var i = 0; i < pointCount; i ++ ) {

					position.set(
						positions[ 3 * i ],
						positions[ 3 * i + 1 ],
						positions[ 3 * i + 2 ]
					);

					testPoint( position, i );

				}

			}

		} else {

			var vertices = this.geometry.vertices;

			for ( var i = 0; i < vertices.length; i ++ ) {

				testPoint( vertices[ i ], i );

			}

		}

	};

}() );

THREE.PointCloud.prototype.clone = function ( object ) {

	if ( object === undefined ) object = new THREE.PointCloud( this.geometry, this.material );

	THREE.Object3D.prototype.clone.call( this, object );

	return object;

};

THREE.PointCloud.prototype.toJSON = function ( meta ) {

	var data = THREE.Object3D.prototype.toJSON.call( this, meta );

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

THREE.ParticleSystem = function ( geometry, material ) {

	console.warn( 'THREE.ParticleSystem has been renamed to THREE.PointCloud.' );
	return new THREE.PointCloud( geometry, material );

};
