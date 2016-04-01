/**
 * @author mrdoob / http://mrdoob.com/
<<<<<<< HEAD
 *  @author MasterJames / http://master-domain.com
 */

THREE.DirectionalLightShadow = function ( camera, owner ) {

	THREE.LightShadow.call( this, camera );

	/* See SpotLightShadow for example of overriding owner */

};

THREE.DirectionalLightShadow.prototype = Object.create( THREE.LightShadow.prototype );

THREE.DirectionalLightShadow.prototype.constructor = THREE.DirectionalLightShadow;

=======
 */

THREE.DirectionalLightShadow = function ( light ) {

	THREE.LightShadow.call( this, new THREE.OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

};
>>>>>>> refs/remotes/mrdoob/dev
