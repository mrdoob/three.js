/**
 * @author bhouston / http://exocortex.com
 */

module( "Frustum" );

test( "constructor", function() {
	var a = new THREE.Frustum();

	ok( a.planes !== undefined, "Passed!" );
	ok( a.planes.length === 6, "Passed!" );
});

test( "setFromMatrix/makeOrthographic/containsPoint", function() {
	var m = new THREE.Matrix4().makeOrthographic( -1, 1, -1, 1, 1, 100 )
	var a = new THREE.Frustum().setFromMatrix( m );

	ok( ! a.containsPoint( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( 0, 0, -50 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( 0, 0, -1.001 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( -1, -1, -1.001 ) ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( -1.1, -1.1, -1.001 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( 1, 1, -1.001 ) ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( 1.1, 1.1, -1.001 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( 0, 0, -100 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( -1, -1, -100 ) ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( -1.1, -1.1, -100.1 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( 1, 1, -100 ) ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( 1.1, 1.1, -100.1 ) ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( 0, 0, -101 ) ), "Passed!" );

});

test( "setFromMatrix/makeFrustum/containsPoint", function() {
	var m = new THREE.Matrix4().makeFrustum( -1, 1, -1, 1, 1, 100 )
	var a = new THREE.Frustum().setFromMatrix( m );

	ok( ! a.containsPoint( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( 0, 0, -50 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( 0, 0, -1.001 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( -1, -1, -1.001 ) ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( -1.1, -1.1, -1.001 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( 1, 1, -1.001 ) ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( 1.1, 1.1, -1.001 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( 0, 0, -99.999 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( -99.999, -99.999, -99.999 ) ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( -100.1, -100.1, -100.1 ) ), "Passed!" );
	ok( a.containsPoint( new THREE.Vector3( 99.999, 99.999, -99.999 ) ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( 100.1, 100.1, -100.1 ) ), "Passed!" );
	ok( ! a.containsPoint( new THREE.Vector3( 0, 0, -101 ) ), "Passed!" );
});