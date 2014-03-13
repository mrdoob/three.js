/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.UV = function ( u, v ) {

	//using texel coordinates
	return new THREE.Vector2( u, 1 - v );

};
