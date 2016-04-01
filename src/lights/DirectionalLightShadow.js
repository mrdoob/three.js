/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.DirectionalLightShadow = function ( light ) {

	THREE.LightShadow.call( this, new THREE.OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

};
