/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = LOD;

var Object3D = require( "../core/Object3D" ),
	Vector3 = require( "../math/Vector3" );

function LOD() {

	Object3D.call( this );

	this.type = 'LOD';

	Object.defineProperties( this, {
		levels: {
			enumerable: true,
			value: []
		},
		objects: {
			get: function () {

				console.warn( "LOD: .objects has been renamed to .levels." );
				return this.levels;

			}
		}
	} );

}

LOD.prototype = Object.create( Object3D.prototype );
LOD.prototype.constructor = LOD;

LOD.prototype.addLevel = function ( object, distance ) {

	if ( distance === undefined ) { distance = 0; }

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

LOD.prototype.getObjectForDistance = function ( distance ) {

	var levels = this.levels;

	for ( var i = 1, l = levels.length; i < l; i ++ ) {

		if ( distance < levels[ i ].distance ) {

			break;

		}

	}

	return levels[ i - 1 ].object;

};

LOD.prototype.raycast = ( function () {

	var matrixPosition = new Vector3();

	return function raycast( raycaster, intersects ) {

		matrixPosition.setFromMatrixPosition( this.matrixWorld );

		var distance = raycaster.ray.origin.distanceTo( matrixPosition );

		this.getObjectForDistance( distance ).raycast( raycaster, intersects );

	};

}() );

LOD.prototype.update = ( function () {

	var v1 = new Vector3();
	var v2 = new Vector3();

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

}() );

LOD.prototype.copy = function ( source ) {

	Object3D.prototype.copy.call( this, source, false );

	var levels = source.levels;

	for ( var i = 0, l = levels.length; i < l; i ++ ) {

		var level = levels[ i ];

		this.addLevel( level.object.clone(), level.distance );

	}

	return this;

};

LOD.prototype.toJSON = function ( meta ) {

	var data = Object3D.prototype.toJSON.call( this, meta );

	data.object.levels = [];

	var levels = this.levels;

	for ( var i = 0, l = levels.length; i < l; i ++ ) {

		var level = levels[ i ];

		data.object.levels.push( {
			object: level.object.uuid,
			distance: level.distance
		} );

	}

	return data;

};
