/**
 * @author RaiNova / mailto:RNova@gmx.net
 */

module( "Raycaster" );

test( "intersectObject", function() {
	var createSimpleLine = function ( v0, v1 ) {
		var geometry = new THREE.Geometry();
		geometry.vertices.push( v0 );
		geometry.vertices.push( v1 );
		return new THREE.Line( geometry );
	};

	var o0 = new THREE.Vector3( 1, 2, 3 );
	
	var a = new THREE.Raycaster( new THREE.Vector3(0,0,0), new THREE.Vector3(1,2,0).normalize(), .1, 10000 );

	var intersects = a.intersectObject( createSimpleLine( new THREE.Vector3(1,2,0), o0) );
	ok( intersects.length == 1, "Passed!" );

	intersects = a.intersectObject( createSimpleLine( o0, new THREE.Vector3(1,2,-3)) );
	ok( intersects.length == 1, "Passed!" );

	intersects = a.intersectObject( createSimpleLine( o0, new THREE.Vector3(2, 4, 0)) );
	ok( intersects.length == 1, "Passed!" );

	intersects = a.intersectObject( createSimpleLine( o0, new THREE.Vector3(2, 4, 1)) );
	ok( intersects.length == 0, "Passed!" );
});
