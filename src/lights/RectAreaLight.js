/**
 * @author abelnation / http://github.com/abelnation
 */

THREE.RectAreaLight = function ( color, intensity, width, height ) {

	THREE.Light.call( this, color, intensity );

	this.type = 'RectAreaLight';

	this.position.set( 0, 1, 0 );
	this.updateMatrix();

	this.width = ( width !== undefined ) ? width : 10;
	this.height = ( height !== undefined ) ? height : 10;

	// TODO (abelnation): remove this warning when RectAreaLight is fully included in build files
	if (THREE.UniformsLib['ltc_brdf'] == undefined) {
		console.warn( 'RectAreaLight will not function properly without including examples/js/lights/RectAreaLightUniformsLib.js' );
	}

	// TODO (abelnation): distance/decay

};

THREE.RectAreaLight.prototype = Object.create( THREE.Light.prototype );
THREE.RectAreaLight.prototype.constructor = THREE.RectAreaLight;

THREE.RectAreaLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.width = source.width;
	this.height = source.height;

	return this;

};
