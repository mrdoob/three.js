/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.AmbientLight = function AmbientLight ( color ) {

	THREE.Light.call( this, color );

	this.type = 'AmbientLight';

};

THREE.AmbientLight.prototype = Object.create( THREE.Light.prototype );
THREE.AmbientLight.prototype.constructor = THREE.AmbientLight;
