/**
 * @author bhouston / http://exocortex.com
 */

var x = 2;
var y = 3;
var z = 4;
var w = 5;

var zero = new THREE.Vector3();
var one = new THREE.Vector3( 1, 1, 1 );

module( "Box3" );

test( "constructor", function() {
	var a = new THREE.Box3();
	console.log( a );
	console.log( a.empty() );
	ok( a.empty(), "Passed!" );
	ok( a.volume() < 0, "Passed!" );

	a = new THREE.Box3( zero );
	ok( a.min.equals( zero ), "Passed!" );
	ok( a.max.equals( zero ), "Passed!" );

	a = new THREE.Box3( zero, one );
	ok( a.min.equals( zero ), "Passed!" );
	ok( a.max.equals( one ), "Passed!" );
});

test( "copy", function() {
	var a = new THREE.Box3( zero, one );
	var b = new THREE.Box3().copy( a );
	ok( b.min.equals( zero ), "Passed!" );
	ok( b.max.equals( one ), "Passed!" );

	// ensure that it is a true copy
	a.makeEmpty();
	ok( b.min.equals( zero ), "Passed!" );
	ok( b.max.equals( one ), "Passed!" );
});

test( "set", function() {
	var a = new THREE.Box3();
	ok( a.empty(), "Passed!" );

	a.set( zero, one )
	ok( a.min.equals( zero ), "Passed!" );
	ok( a.max.equals( one ), "Passed!" );
});

