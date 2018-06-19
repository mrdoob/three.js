THREE.NodeLib.addKeyword( 'uv', function () {

	return new THREE.UVNode();

} );

THREE.NodeLib.addKeyword( 'uv2', function () {

	return new THREE.UVNode( 1 );

} );

THREE.NodeLib.addKeyword( 'position', function () {

	return new THREE.PositionNode();

} );

THREE.NodeLib.addKeyword( 'worldPosition', function () {

	return new THREE.PositionNode( THREE.PositionNode.WORLD );

} );

THREE.NodeLib.addKeyword( 'normal', function () {

	return new THREE.NormalNode();

} );

THREE.NodeLib.addKeyword( 'worldNormal', function () {

	return new THREE.NormalNode( THREE.NormalNode.WORLD );

} );

THREE.NodeLib.addKeyword( 'viewPosition', function () {

	return new THREE.PositionNode( THREE.NormalNode.VIEW );

} );

THREE.NodeLib.addKeyword( 'viewNormal', function () {

	return new THREE.NormalNode( THREE.NormalNode.VIEW );

} );

THREE.NodeLib.addKeyword( 'time', function () {

	return new THREE.TimerNode();

} );
