/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.DirectionalLightShadow = function ( light ) {

	THREE.LightShadow.call( this, new THREE.OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

};

THREE.DirectionalLightShadow.prototype = Object.assign( Object.create( THREE.LightShadow.prototype ), {

	constructor: THREE.DirectionalLightShadow

} );
