/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Face4 = function Face4 ( a, b, c, d, normal, color, materialIndex ) {

	console.warn( 'THREE.Face4 has been removed. A THREE.Face3 will be created instead.' );
	return new THREE.Face3( a, b, c, normal, color, materialIndex );

};
