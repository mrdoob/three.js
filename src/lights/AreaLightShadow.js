/**
 * @author aallison / http://github.com/abelnation
 */

THREE.AreaLightShadow = function () {

	THREE.LightShadow.call( this, new THREE.PerspectiveCamera( 50, 1, 0.5, 500 ) );

};

THREE.AreaLightShadow.prototype = Object.create( THREE.LightShadow.prototype );
THREE.AreaLightShadow.prototype.constructor = THREE.AreaLightShadow;

THREE.AreaLightShadow.prototype.update = function ( light ) {

	// TODO (abelnation): implement

};
