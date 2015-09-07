/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "Camera" );

test( "lookAt", function() {
	var obj = new THREE.Camera();
	obj.lookAt(new THREE.Vector3(0, 1, -1));

	ok( obj.rotation.x * (180 / Math.PI) === 45 , "x is equal" );
});
