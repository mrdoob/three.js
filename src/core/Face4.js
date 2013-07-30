/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Face4 = function ( a, b, c, d, normal, color, materialIndex ) {

	return new THREE.Face3( a, b, c, normal, color, materialIndex );

};
