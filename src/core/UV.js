/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.UV = function ( u, v ) {

	console.warn( 'THREE.UV has been DEPRECATED. Use THREE.Vector2 instead.')
	return new THREE.Vector2( u, v );

};
