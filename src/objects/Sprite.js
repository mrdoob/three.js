/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

var BufferAttribute = require( "../core/BufferAttribute" ),
	BufferGeometry = require( "../core/BufferGeometry" ),
	Object3D = require( "../core/Object3D" ),
	SpriteMaterial = require( "../materials/SpriteMaterial" ),
	Vector3 = require( "../math/Vector3" );

module.exports = ( function () {

	var indices = new Uint16Array( [ 0, 1, 2,  0, 2, 3 ] );
	var vertices = new Float32Array( [ - 0.5, - 0.5, 0,   0.5, - 0.5, 0,   0.5, 0.5, 0,   - 0.5, 0.5, 0 ] );
	var uvs = new Float32Array( [ 0, 0,   1, 0,   1, 1,   0, 1 ] );

	var geometry = new BufferGeometry();
	geometry.addIndex( new BufferAttribute( indices, 1 ) );
	geometry.addAttribute( "position", new BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( "uv", new BufferAttribute( uvs, 2 ) );

	return function ( material ) {

		Object3D.call( this );

		this.type = "Sprite";

		this.geometry = geometry;
		this.material = ( material !== undefined ) ? material : new SpriteMaterial();

	};

}() );

module.exports.prototype = Object.create( Object3D.prototype );
module.exports.prototype.constructor = module.exports;

module.exports.prototype.raycast = ( function () {

	var matrixPosition = new Vector3();

	return function raycast( raycaster, intersects ) {

		matrixPosition.setFromMatrixPosition( this.matrixWorld );

		var distanceSq = raycaster.ray.distanceSqToPoint( matrixPosition );
		var guessSizeSq = this.scale.x * this.scale.y;

		if ( distanceSq > guessSizeSq ) {

			return;

		}

		intersects.push( {
			distance: Math.sqrt( distanceSq ),
			point: this.position,
			face: null,
			object: this
		} );

	};

}() );

module.exports.prototype.clone = function () {

	return new this.constructor( this.material ).copy( this );

};

module.exports.prototype.toJSON = function ( meta ) {

	var data = Object3D.prototype.toJSON.call( this, meta );

	// only serialize if not in meta materials cache
	if ( meta.materials[ this.material.uuid ] === undefined ) {

		meta.materials[ this.material.uuid ] = this.material.toJSON();

	}

	data.object.material = this.material.uuid;

	return data;

};
