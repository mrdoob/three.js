/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Points = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.type = 'Points';

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.PointsMaterial( { color: Math.random() * 0xffffff } );

};

THREE.Points.prototype = Object.create( THREE.Object3D.prototype );
THREE.Points.prototype.constructor = THREE.Points;

THREE.Points.prototype.raycast = ( function () {

	var inverseMatrix = new THREE.Matrix4();
	var ray = new THREE.Ray();

	return function raycast( raycaster, intersects ) {

		var object = this;
		var geometry = object.geometry;
		var threshold = raycaster.params.Points.threshold;

		inverseMatrix.getInverse( this.matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

		if ( geometry.boundingBox !== null ) {

			if ( ray.isIntersectionBox( geometry.boundingBox ) === false ) {

				return;

			}

		}

		var localThreshold = threshold / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
		var localThresholdSq = localThreshold * localThreshold;
		var position = new THREE.Vector3();

		function testPoint( point, index ) {

			var rayPointDistanceSq = ray.distanceSqToPoint( point );

			if ( rayPointDistanceSq < localThresholdSq ) {

				var intersectPoint = ray.closestPointToPoint( point );
				intersectPoint.applyMatrix4( object.matrixWorld );

				var distance = raycaster.ray.origin.distanceTo( intersectPoint );

				if ( distance < raycaster.near || distance > raycaster.far ) return;

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

		if ( geometry instanceof THREE.BufferGeometry ) {

			var index = geometry.index;
			var attributes = geometry.attributes;
			var positions = attributes.position.array;

			if ( index !== null ) {

				var indices = index.array;

				for ( var i = 0, il = indices.length; i < il; i ++ ) {

					var a = indices[ i ];

					position.fromArray( positions, a * 3 );

					testPoint( position, a );

				}

			} else {

				for ( var i = 0, l = positions.length / 3; i < l; i ++ ) {

					position.fromArray( positions, i * 3 );

					testPoint( position, i );

				}

			}

		} else {

			var vertices = geometry.vertices;

			for ( var i = 0, l = vertices.length; i < l; i ++ ) {

				testPoint( vertices[ i ], i );

			}

		}

	};

}() );

THREE.Points.prototype.clone = function () {

	return new this.constructor( this.geometry, this.material ).copy( this );

};

THREE.Points.prototype.toJSON = function ( meta ) {

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

THREE.PointCloud = function ( geometry, material ) {

	console.warn( 'THREE.PointCloud has been renamed to THREE.Points.' );
	return new THREE.Points( geometry, material );

};

THREE.ParticleSystem = function ( geometry, material ) {

	console.warn( 'THREE.ParticleSystem has been renamed to THREE.Points.' );
	return new THREE.Points( geometry, material );

};
