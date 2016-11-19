/**
 * @author aallison / http://github.com/abelnation
 */

THREE.RectAreaLightShadow = function () {

	THREE.LightShadow.call( this, new THREE.PerspectiveCamera( 50, 1, 0.5, 500 ) );

};

THREE.RectAreaLightShadow.prototype = Object.create( THREE.LightShadow.prototype );
THREE.RectAreaLightShadow.prototype.constructor = THREE.RectAreaLightShadow;

THREE.RectAreaLightShadow.prototype.update = function ( light ) {

	// TODO (abelnation): implement

};
