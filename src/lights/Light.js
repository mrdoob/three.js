/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Light = function ( color ) {

	THREE.Object3D.call( this );

	this.type = 'Light';

	this.color = new THREE.Color( color );

	this.receiveShadow = undefined;

};

THREE.Light.prototype = Object.create( THREE.Object3D.prototype );
THREE.Light.prototype.constructor = THREE.Light;

Object.defineProperties( THREE.Light.prototype, {
	onlyShadow: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .onlyShadow has been removed.' );
		}
	},
	shadowCameraFov: {
		set: function ( value ) {
			this.shadow.camera.fov = value;
		}
	},
	shadowCameraLeft: {
		set: function ( value ) {
			this.shadow.camera.left = value;
		}
	},
	shadowCameraRight: {
		set: function ( value ) {
			this.shadow.camera.right = value;
		}
	},
	shadowCameraTop: {
		set: function ( value ) {
			this.shadow.camera.top = value;
		}
	},
	shadowCameraBottom: {
		set: function ( value ) {
			this.shadow.camera.bottom = value;
		}
	},
	shadowCameraNear: {
		set: function ( value ) {
			this.shadow.camera.near = value;
		}
	},
	shadowCameraFar: {
		set: function ( value ) {
			this.shadow.camera.far = value;
		}
	},
	shadowCameraVisible: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper( light.shadow ) instead.' );
		}
	},
	shadowBias: {
		set: function ( value ) {
			this.shadow.bias = value;
		}
	},
	shadowDarkness: {
		set: function ( value ) {
			this.shadow.darkness = value;
		}
	},
	shadowMapWidth: {
		set: function ( value ) {
			this.shadow.mapSize.width = value;
		}
	},
	shadowMapHeight: {
		set: function ( value ) {
			this.shadow.mapSize.height = value;
		}
	}
} );

THREE.Light.prototype.copy = function ( source ) {

	THREE.Object3D.prototype.copy.call( this, source );

	this.color.copy( source.color );

	return this;

};

THREE.Light.prototype.toJSON = function ( meta ) {

	var data = THREE.Object3D.prototype.toJSON.call( this, meta );

	data.object.color = this.color.getHex();
	if ( this.groundColor !== undefined ) data.object.groundColor = this.groundColor.getHex();

	if ( this.intensity !== undefined ) data.object.intensity = this.intensity;
	if ( this.distance !== undefined ) data.object.distance = this.distance;
	if ( this.angle !== undefined ) data.object.angle = this.angle;
	if ( this.decay !== undefined ) data.object.decay = this.decay;
	if ( this.exponent !== undefined ) data.object.exponent = this.exponent;

	return data;

};
