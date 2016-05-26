/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SpotLightShadow = function () {

	THREE.LightShadow.call( this, new THREE.PerspectiveCamera( 50, 1, 0.5, 500 ) );

};

THREE.SpotLightShadow.prototype = Object.assign( Object.create( THREE.LightShadow.prototype ), {

	constructor: THREE.SpotLightShadow,

	update: function ( light ) {

		var fov = THREE.Math.RAD2DEG * 2 * light.angle;
		var aspect = this.mapSize.width / this.mapSize.height;
		var far = light.distance || 500;

		var camera = this.camera;

		if ( fov !== camera.fov || aspect !== camera.aspect || far !== camera.far ) {

			camera.fov = fov;
			camera.aspect = aspect;
			camera.far = far;
			camera.updateProjectionMatrix();

		}

	}

} );
