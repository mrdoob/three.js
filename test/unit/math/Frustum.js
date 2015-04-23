/**
 * @author bhouston / http://exocortex.com
 */

module( "Frustum" );

var unit3 = new THREE.Vector3( 1, 0, 0 );

var planeEquals = function ( a, b, tolerance ) {
	tolerance = tolerance || 0.0001;
	if( a.normal.distanceTo( b.normal ) > tolerance ) {
		return false;
	}
	if( Math.abs( a.constant - b.constant ) > tolerance ) {
		return false;
	}
	return true;
};

test( "constructor", function() {
	var a = new THREE.Frustum();

	ok( a.planes !== undefined, "Passed!" );
	ok( a.planes.length === 6, "Passed!" );

	var pDefault = new THREE.Plane();
	for( var i = 0; i < 6; i ++ ) {
		ok( a.planes[i].equals( pDefault ), "Passed!" );
	}

	var p0 = new THREE.Plane( unit3, -1 );
	var p1 = new THREE.Plane( unit3, 1 );
	var p2 = new THREE.Plane( unit3, 2 );
	var p3 = new THREE.Plane( unit3, 3 );
	var p4 = new THREE.Plane( unit3, 4 );
	var p5 = new THREE.Plane( unit3, 5 );

	a = new THREE.Frustum( p0, p1, p2, p3, p4, p5 );
	ok( a.planes[0].equals( p0 ), "Passed!" );
	ok( a.planes[1].equals( p1 ), "Passed!" );
	ok( a.planes[2].equals( p2 ), "Passed!" );
	ok( a.planes[3].equals( p3 ), "Passed!" );
	ok( a.planes[4].equals( p4 ), "Passed!" );
	ok( a.planes[5].equals( p5 ), "Passed!" );
});

test( "copy", function() {

	var p0 = new THREE.Plane( unit3, -1 );
	var p1 = new THREE.Plane( unit3, 1 );
	var p2 = new THREE.Plane( unit3, 2 );
	var p3 = new THREE.Plane( unit3, 3 );
	var p4 = new THREE.Plane( unit3, 4 );
	var p5 = new THREE.Plane( unit3, 5 );

	var b = new THREE.Frustum( p0, p1, p2, p3, p4, p5 );
	var a = new THREE.Frustum().copy( b );
	ok( a.planes[0].equals( p0 ), "Passed!" );
	ok( a.planes[1].equals( p1 ), "Passed!" );
	ok( a.planes[2].equals( p2 ), "Passed!" );
	ok( a.planes[3].equals( p3 ), "Passed!" );
	ok( a.planes[4].equals( p4 ), "Passed!" );
	ok( a.planes[5].equals( p5 ), "Passed!" );

	// ensure it is a true copy by modifying source
	b.planes[0] = p1;
	ok( a.planes[0].equals( p0 ), "Passed!" );
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

test( "setFromMatrix/makeFrustum/intersectsSphere", function() {
	var m = new THREE.Matrix4().makeFrustum( -1, 1, -1, 1, 1, 100 )
	var a = new THREE.Frustum().setFromMatrix( m );

	ok( ! a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 0, 0, 0 ), 0 ) ), "Passed!" );
	ok( ! a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 0, 0, 0 ), 0.9 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 0, 0, 0 ), 1.1 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 0, 0, -50 ), 0 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 0, 0, -1.001 ), 0 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( -1, -1, -1.001 ), 0 ) ), "Passed!" );
	ok( ! a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( -1.1, -1.1, -1.001 ), 0 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( -1.1, -1.1, -1.001 ), 0.5 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 1, 1, -1.001 ), 0 ) ), "Passed!" );
	ok( ! a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 1.1, 1.1, -1.001 ), 0 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 1.1, 1.1, -1.001 ), 0.5 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 0, 0, -99.999 ), 0 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( -99.999, -99.999, -99.999 ), 0 ) ), "Passed!" );
	ok( ! a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( -100.1, -100.1, -100.1 ), 0 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( -100.1, -100.1, -100.1 ), 0.5 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 99.999, 99.999, -99.999 ), 0 ) ), "Passed!" );
	ok( ! a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 100.1, 100.1, -100.1 ), 0 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 100.1, 100.1, -100.1 ), 0.2 ) ), "Passed!" );
	ok( ! a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 0, 0, -101 ), 0 ) ), "Passed!" );
	ok( a.intersectsSphere( new THREE.Sphere( new THREE.Vector3( 0, 0, -101 ), 1.1 ) ), "Passed!" );
});

test( "clone", function() {

	var p0 = new THREE.Plane( unit3, -1 );
	var p1 = new THREE.Plane( unit3, 1 );
	var p2 = new THREE.Plane( unit3, 2 );
	var p3 = new THREE.Plane( unit3, 3 );
	var p4 = new THREE.Plane( unit3, 4 );
	var p5 = new THREE.Plane( unit3, 5 );

	var b = new THREE.Frustum( p0, p1, p2, p3, p4, p5 );
	var a = b.clone();
	ok( a.planes[0].equals( p0 ), "Passed!" );
	ok( a.planes[1].equals( p1 ), "Passed!" );
	ok( a.planes[2].equals( p2 ), "Passed!" );
	ok( a.planes[3].equals( p3 ), "Passed!" );
	ok( a.planes[4].equals( p4 ), "Passed!" );
	ok( a.planes[5].equals( p5 ), "Passed!" );

	// ensure it is a true copy by modifying source
	a.planes[0].copy( p1 );
	ok( b.planes[0].equals( p0 ), "Passed!" );
});