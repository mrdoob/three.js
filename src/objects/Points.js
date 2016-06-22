/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Points = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.type = 'Points';

	this.geometry = geometry !== undefined ? geometry : new THREE.BufferGeometry();
	this.material = material !== undefined ? material : new THREE.PointsMaterial( { color: Math.random() * 0xffffff } );

};

THREE.Points.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {

	constructor: THREE.Points,

	raycast: ( function () {

		var inverseMatrix = new THREE.Matrix4();
		var ray = new THREE.Ray();
		var sphere = new THREE.Sphere();

		return function raycast( raycaster, intersects ) {

			var object = this;
			var geometry = this.geometry;
			var matrixWorld = this.matrixWorld;
			var threshold = raycaster.params.Points.threshold;

			// Checking boundingSphere distance to ray

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			sphere.copy( geometry.boundingSphere );
			sphere.applyMatrix4( matrixWorld );

			if ( raycaster.ray.intersectsSphere( sphere ) === false ) return;

			//

			inverseMatrix.getInverse( matrixWorld );
			ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

			var localThreshold = threshold / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
			var localThresholdSq = localThreshold * localThreshold;
			var position = new THREE.Vector3();

			function testPoint( point, index ) {

				var rayPointDistanceSq = ray.distanceSqToPoint( point );

				if ( rayPointDistanceSq < localThresholdSq ) {

					var intersectPoint = ray.closestPointToPoint( point );
					intersectPoint.applyMatrix4( matrixWorld );

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

	}() ),

	clone: function () {

		return new this.constructor( this.geometry, this.material ).copy( this );

	}

} );
