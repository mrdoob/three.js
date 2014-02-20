// DEPRECATED

THREE.CubeGeometry = function ( width, height, depth, widthSegments, heightSegments, depthSegments ) {
	console.warn( 'DEPRECATED: THREE.CubeGeometry is deprecated. Use THREE.BoxGeometry instead.' );
 	return new THREE.BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );
 };