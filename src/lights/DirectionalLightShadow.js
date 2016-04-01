/**
 * @author mrdoob / http://mrdoob.com/
 *  @author MasterJames / http://master-domain.com
 */

THREE.DirectionalLightShadow = function ( camera, owner ) {

	THREE.LightShadow.call( this, camera );

	/* See SpotLightShadow for example of overriding owner */

};

THREE.DirectionalLightShadow.prototype = Object.create( THREE.LightShadow.prototype );

THREE.DirectionalLightShadow.prototype.constructor = THREE.DirectionalLightShadow;

