/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LightShadow = function ( camera ) {

	this.camera = camera;

	this.bias = 0;
	this.darkness = 1;
	this.lightRadius = 0.05; // default bulb size is 5cm

	this.mapSize = new THREE.Vector2( 512, 512 );

	this.map = null;
	this.matrix = null;

};

THREE.LightShadow.prototype = {

	constructor: THREE.LightShadow,

	copy: function ( source ) {

		this.camera = source.camera.clone();

		this.bias = source.bias;
		this.darkness = source.darkness;
		this.lightRadius = source.lightRadius;

		this.mapSize.copy( source.mapSize );

		return this;

	},

	clone: function () {

		return new this.constructor().copy( this );

	}

};
