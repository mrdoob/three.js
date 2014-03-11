/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PlaneGeometry = function ( width, height, widthSegments, heightSegments ) {

	return new THREE.Geometry2( new THREE.PlaneBufferGeometry( width, height, widthSegments, heightSegments ) );

};
