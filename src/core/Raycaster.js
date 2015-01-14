/**
 * @author mrdoob / http://mrdoob.com/
 * @author bhouston / http://exocortex.com/
 * @author stephomi / http://stephaneginier.com/
 */

( function ( THREE ) {

	THREE.Raycaster = function ( origin, direction, near, far ) {

		this.ray = new THREE.Ray( origin, direction );
		// direction is assumed to be normalized (for accurate distance calculations)

		this.near = near || 0;
		this.far = far || Infinity;

		this.params = {
			Sprite: {},
			Mesh: {},
			PointCloud: { threshold: 1 },
			LOD: {},
			Line: {}
		};

	};

	var descSort = function ( a, b ) {

		return a.distance - b.distance;

	};

	var intersectObject = function ( object, raycaster, intersects, recursive ) {

		object.raycast( raycaster, intersects );

		if ( recursive === true ) {

			var children = object.children;

			for ( var i = 0, l = children.length; i < l; i ++ ) {

				intersectObject( children[ i ], raycaster, intersects, true );

			}

		}

	};

	//

	THREE.Raycaster.prototype = {

		constructor: THREE.Raycaster,

		precision: 0.0001,
		linePrecision: 1,

		set: function ( origin, direction ) {

			// direction is assumed to be normalized (for accurate distance calculations)

			this.ray.set( origin, direction );

		},

		setFromCamera: function ( coords, camera ) {

			// camera is assumed _not_ to be a child of a transformed object

			if ( camera instanceof THREE.PerspectiveCamera ) {

				this.ray.origin.copy( camera.position );
				this.ray.direction.set( coords.x, coords.y, 0.5 ).unproject( camera ).sub( camera.position ).normalize();

			} else if ( camera instanceof THREE.OrthographicCamera ) {

				this.ray.origin.set( coords.x, coords.y, - 1 ).unproject( camera );
				this.ray.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );

			} else {

				console.error( 'THREE.Raycaster: Unsupported camera type.' );

			}

		},

		intersectObject: function ( object, recursive ) {

			var intersects = [];

			intersectObject( object, this, intersects, recursive );

			intersects.sort( descSort );

			return intersects;

		},

		intersectObjects: function ( objects, recursive ) {

			var intersects = [];

			if ( objects instanceof Array === false ) {

				console.log( 'THREE.Raycaster.intersectObjects: objects is not an Array.' );
				return intersects;

			}

			for ( var i = 0, l = objects.length; i < l; i ++ ) {

				intersectObject( objects[ i ], this, intersects, recursive );

			}

			intersects.sort( descSort );

			return intersects;

		}

	};

}( THREE ) );
