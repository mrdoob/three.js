/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SpotLight = function ( hex, intensity, distance, angle, exponent ) {

	THREE.Light.call( this, hex );

	this.position.set( 0, 1, 0 );
	this.target = new THREE.Object3D();

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;
	this.angle = ( angle !== undefined ) ? angle : Math.PI / 3;
	this.exponent = ( exponent !== undefined ) ? exponent : 10;

	this.castShadow = false;
	this.onlyShadow = false;

	//

	this.shadowCameraNear = 50;
	this.shadowCameraFar = 5000;
	this.shadowCameraFov = 50;

	this.shadowCameraVisible = false;

	this.shadowBias = 0;
	this.shadowDarkness = 0.5;

	this.shadowMapWidth = 512;
	this.shadowMapHeight = 512;

	//

	this.shadowMap = null;
	this.shadowMapSize = null;
	this.shadowCamera = null;
	this.shadowMatrix = null;

};

THREE.SpotLight.prototype = Object.create( THREE.Light.prototype );

THREE.SpotLight.prototype.clone = function () {

	var light = new THREE.SpotLight();

	THREE.Light.prototype.clone.call( this, light );

	light.target = this.target.clone();

	light.intensity = this.intensity;
	light.distance = this.distance;
	light.angle = this.angle;
	light.exponent = this.exponent;

	light.castShadow = this.castShadow;
	light.onlyShadow = this.onlyShadow;

	return light;

};



THREE.SmartSpotLight = function ( params ) {
/**
 * Wrapper for SpotLight.
 * parameters 	-->	object with specifications (parameters)
 * 	color			:	light color, instanceof Color
 * 						default = white
 * 	main_intensity	:	intensity at main_distance (should be between 0.0 and 1.0)
 * 						default = 1.0
 * 	main_distance	:	distance at which intensity is as specified by the parameter 'intensity'
 * 						default = 1.0
 * 	fade_type		:	'constant', for constant intensity (no decay)
 * 						'linear', 	linear decay until, intensity becomes 0.0 by fade_distance
 * 						'quadratic', quadratic decay, intensity remains constant
 *							for distances < near_distance
 * 						default = 'constant'
 * angle			:	same as for SpotLight
 * exponent			:	same as for SpotLight 
 *
 * For LINEAR SpotLight:
 * 	fade_distance	: 	distance from main_distance where light intensity becomes 0.0
 * 						default = 1.0
 * For QUADRATIC SpotLight
 * 	near_distance	:	For shorter distances than this, light intensity remains constant.
 * 						Think about it like the "light bulb radius", you do not put objects
 * 						within this distance. The default value tries to be a useful one
 *							in most situations: change only if needed.
 * 						default = 0.01
 */
	if (typeof params === 'undefined') params = {};
	var color 		= 	params.color instanceof THREE.Color ?
						params.color : new THREE.Color(0xffffff);
	var main_intensity 	= 	typeof params.main_intensity === 'number' &&
						! (params.main_intensity < 0.0) ?
						params.main_intensity : 1.0;
	var main_distance	= 	typeof params.main_distance === 'number' &&
						! (params.main_distance <= 0.0) ?
						params.main_distance : 1.0;
	var fade_type		= 	params.fade_type === 'constant' ||
						params.fade_type === 'linear' ||
						params.fade_type === 'quadratic' ?
						params.fade_type : 'constant';
	var fade_distance	= 	typeof params.fade_distance === 'number' &&
						! (params.fade_distance <= 0.0) ?
						params.fade_distance : 1.0;
	var near_distance	= 	typeof params.near_distance === 'number' &&
						! (params.near_distance <= 0.0) ?
						params.near_distance : 1.0;
	var angle			= 	typeof params.angle === 'number' &&
						params.angle > 0 && params.angle <= Math.PI/2 ?
						params.angle : Math.PI/3;
	var exponent		= 	typeof params.exponent === 'number' &&
						params.exponent >= 0 ?
						params.exponent : 10;	

	var	hex,
		intensity,
		distance,
		quadratic;
	hex = color.getHex();
	if ( fade_type === 'quadratic'){
		distance = near_distance;
		intensity = Math.pow( main_distance/near_distance, 2 ) * main_intensity;
		quadratic = true;
	} else if ( fade_type === 'linear' ) {
		distance = main_distance + fade_distance;
		intensity = (1 + main_distance / fade_distance ) * main_intensity;
	} else {
		// fade_type should be 'constant' if we got here
		distance = 0;
		intensity = main_intensity;
	}
	THREE.SpotLight.call( this, hex, intensity, distance, angle, exponent, quadratic );
}

THREE.SmartSpotLight.prototype = Object.create( THREE.SpotLight.prototype );
