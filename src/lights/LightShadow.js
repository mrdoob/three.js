/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LightShadow = function ( camera ) {

	this.camera = camera;

	this.bias = 0;
	this.radius = 1;

	this.mapSize = new THREE.Vector2( 512, 512 );

	this.map = null;
	this.matrix = new THREE.Matrix4();

};

Object.assign( THREE.LightShadow.prototype, {

	copy: function ( source ) {

		this.camera = source.camera.clone();

		this.bias = source.bias;
		this.radius = source.radius;

		this.mapSize.copy( source.mapSize );

		return this;

	},

	clone: function () {

		return new this.constructor().copy( this );

	}

} );
