/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Light = function ( color ) {

	THREE.Object3D.call( this );

	this.type = 'Light';

	this.color = new THREE.Color( color );

};

THREE.Light.prototype = Object.create( THREE.Object3D.prototype );
THREE.Light.prototype.constructor = THREE.Light;

Object.defineProperties( THREE.Light.prototype, {
	castShadow: {
		get: function () {
			if ( this.shadow === undefined ) return false;
			return this.shadow.enabled;
		},
		set: function ( value ) {
			if ( this.shadow === undefined ) return;
			this.shadow.enabled = value;
		}
	},
	onlyShadow: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .onlyShadow has been removed.' );
		}
	},
	shadowCamera: {
		get: function () {
			return this.shadow.camera;
		}
	},
	shadowCameraFov: {
		get: function () {
			return this.shadow.camera.fov;
		},
		set: function ( value ) {
			this.shadow.camera.fov = value;
		}
	},
	shadowCameraLeft: {
		get: function () {
			return this.shadow.camera.left;
		},
		set: function ( value ) {
			this.shadow.camera.left = value;
		}
	},
	shadowCameraRight: {
		get: function () {
			return this.shadow.camera.right;
		},
		set: function ( value ) {
			this.shadow.camera.right = value;
		}
	},
	shadowCameraTop: {
		get: function () {
			return this.shadow.camera.top;
		},
		set: function ( value ) {
			this.shadow.camera.top = value;
		}
	},
	shadowCameraBottom: {
		get: function () {
			return this.shadow.camera.bottom;
		},
		set: function ( value ) {
			this.shadow.camera.bottom = value;
		}
	},
	shadowCameraNear: {
		get: function () {
			return this.shadow.camera.near;
		},
		set: function ( value ) {
			this.shadow.camera.near = value;
		}
	},
	shadowCameraFar: {
		get: function () {
			return this.shadow.camera.far;
		},
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
		get: function () {
			return this.shadow.bias;
		},
		set: function ( value ) {
			this.shadow.bias = value;
		}
	},
	shadowDarkness: {
		get: function () {
			return this.shadow.darkness;
		},
		set: function ( value ) {
			this.shadow.darkness = value;
		}
	},
	shadowMap: {
		get: function () {
			return this.shadow.map;
		},
		set: function ( value ) {
			this.shadow.map = value;
		}
	},
	shadowMapSize: {
		get: function () {
			return this.shadow.mapSize;
		}
	},
	shadowMapWidth: {
		get: function () {
			return this.shadow.mapSize.x;
		},
		set: function ( value ) {
			this.shadow.mapSize.x = value;
		}
	},
	shadowMapHeight: {
		get: function () {
			return this.shadow.mapSize.y;
		},
		set: function ( value ) {
			this.shadow.mapSize.y = value;
		}
	},
	shadowMatrix: {
		get: function () {
			return this.shadow.matrix;
		},
		set: function ( value ) {
			this.shadow.matrix = value;
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
