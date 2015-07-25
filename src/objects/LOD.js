/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LOD = function () {

	THREE.Object3D.call( this );

	Object.defineProperties( this, {
		levels: {
			enumerable: true,
			value: []
		},
		objects: {
			get: function () {

				console.warn( 'THREE.LOD: .objects has been renamed to .levels.' );
				return this.levels;

			}
		}
	} );

};


THREE.LOD.prototype = Object.create( THREE.Object3D.prototype );
THREE.LOD.prototype.constructor = THREE.LOD;

THREE.LOD.prototype.addLevel = function ( object, distance ) {

	if ( distance === undefined ) distance = 0;

	distance = Math.abs( distance );

	var levels = this.levels;

	for ( var l = 0; l < levels.length; l ++ ) {

		if ( distance < levels[ l ].distance ) {

			break;

		}

	}

	levels.splice( l, 0, { distance: distance, object: object } );

	this.add( object );

};

THREE.LOD.prototype.getObjectForDistance = function ( distance ) {

	var levels = this.levels;

	for ( var i = 1, l = levels.length; i < l; i ++ ) {

		if ( distance < levels[ i ].distance ) {

			break;

		}

	}

	return levels[ i - 1 ].object;

};

THREE.LOD.prototype.raycast = ( function () {

	var matrixPosition = new THREE.Vector3();

	return function raycast( raycaster, intersects ) {

		matrixPosition.setFromMatrixPosition( this.matrixWorld );

		var distance = raycaster.ray.origin.distanceTo( matrixPosition );

		this.getObjectForDistance( distance ).raycast( raycaster, intersects );

	};

}() );

THREE.LOD.prototype.update = function () {

	var v1 = new THREE.Vector3();
	var v2 = new THREE.Vector3();

	return function update( camera ) {

		var levels = this.levels;

		if ( levels.length > 1 ) {

			v1.setFromMatrixPosition( camera.matrixWorld );
			v2.setFromMatrixPosition( this.matrixWorld );

			var distance = v1.distanceTo( v2 );

			levels[ 0 ].object.visible = true;

			for ( var i = 1, l = levels.length; i < l; i ++ ) {

				if ( distance >= levels[ i ].distance ) {

					levels[ i - 1 ].object.visible = false;
					levels[ i ].object.visible = true;

				} else {

					break;

				}

			}

			for ( ; i < l; i ++ ) {

				levels[ i ].object.visible = false;

			}

		}

	};

}();

THREE.LOD.prototype.clone = function () {

	var lod = new THREE.LOD();
	return lod.copy( this );

};


THREE.LOD.prototype.copy = function ( source ) {

	THREE.Object3D.prototype.copy.call( this, source, false );

	var levels = source.levels;

	for ( var i = 0, l = levels.length; i < l; i ++ ) {

		var level = levels[ i ];

		this.addLevel( level.object.clone(), level.distance );

	}

	return this;

};
