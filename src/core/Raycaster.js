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

	var intersectDescendants = function ( object, raycaster, intersects ) {

		var descendants = object.getDescendants();

		for ( var i = 0, l = descendants.length; i < l; i ++ ) {

			descendants[ i ].raycast( raycaster, intersects );

		}

	};

	//

	THREE.Raycaster.prototype.precision = 0.0001;
	THREE.Raycaster.prototype.linePrecision = 1;

	THREE.Raycaster.prototype.set = function ( origin, direction ) {

		this.ray.set( origin, direction );
		// direction is assumed to be normalized (for accurate distance calculations)

	};

	THREE.Raycaster.prototype.intersectObject = function ( object, recursive ) {

		var intersects = [];

		object.raycast( this, intersects );

		if ( recursive === true ) {

			intersectDescendants( object, this, intersects );

		}

		intersects.sort( descSort );

		return intersects;

	};

	THREE.Raycaster.prototype.intersectObjects = function ( objects, recursive ) {

		var intersects = [];

		for ( var i = 0, l = objects.length; i < l; i ++ ) {

			var object = objects[ i ];
			
			object.raycast( this, intersects );

			if ( recursive === true ) {

				intersectDescendants( object, this, intersects );

			}

		}

		intersects.sort( descSort );

		return intersects;

	};

}( THREE ) );
