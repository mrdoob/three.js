/**
 * @author bhouston / http://exocortex.com
 */

QUnit.module( "Box3" );

QUnit.test( "constructor" , function( assert ) {
	var a = new THREE.Box3();
	assert.ok( a.min.equals( posInf3 ), "Passed!" );
	assert.ok( a.max.equals( negInf3 ), "Passed!" );

	a = new THREE.Box3( zero3.clone(), zero3.clone() );
	assert.ok( a.min.equals( zero3 ), "Passed!" );
	assert.ok( a.max.equals( zero3 ), "Passed!" );

	a = new THREE.Box3( zero3.clone(), one3.clone() );
	assert.ok( a.min.equals( zero3 ), "Passed!" );
	assert.ok( a.max.equals( one3 ), "Passed!" );
});

QUnit.test( "copy" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	var b = new THREE.Box3().copy( a );
	assert.ok( b.min.equals( zero3 ), "Passed!" );
	assert.ok( b.max.equals( one3 ), "Passed!" );

	// ensure that it is a true copy
	a.min = zero3;
	a.max = one3;
	assert.ok( b.min.equals( zero3 ), "Passed!" );
	assert.ok( b.max.equals( one3 ), "Passed!" );
});

QUnit.test( "set" , function( assert ) {
	var a = new THREE.Box3();

	a.set( zero3, one3 );
	assert.ok( a.min.equals( zero3 ), "Passed!" );
	assert.ok( a.max.equals( one3 ), "Passed!" );
});

QUnit.test( "setFromPoints" , function( assert ) {
	var a = new THREE.Box3();

	a.setFromPoints( [ zero3, one3, two3 ] );
	assert.ok( a.min.equals( zero3 ), "Passed!" );
	assert.ok( a.max.equals( two3 ), "Passed!" );

	a.setFromPoints( [ one3 ] );
	assert.ok( a.min.equals( one3 ), "Passed!" );
	assert.ok( a.max.equals( one3 ), "Passed!" );

	a.setFromPoints( [] );
	assert.ok( a.isEmpty(), "Passed!" );
});

QUnit.test( "empty/makeEmpty", function( assert ) {
	var a = new THREE.Box3();

	assert.ok( a.isEmpty(), "Passed!" );

	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	assert.ok( ! a.isEmpty(), "Passed!" );

	a.makeEmpty();
	assert.ok( a.isEmpty(), "Passed!" );
});

QUnit.test( "getCenter" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	assert.ok( a.getCenter().equals( zero3 ), "Passed!" );

	a = new THREE.Box3( zero3.clone(), one3.clone() );
	var midpoint = one3.clone().multiplyScalar( 0.5 );
	assert.ok( a.getCenter().equals( midpoint ), "Passed!" );
});

QUnit.test( "getSize" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	assert.ok( a.getSize().equals( zero3 ), "Passed!" );

	a = new THREE.Box3( zero3.clone(), one3.clone() );
	assert.ok( a.getSize().equals( one3 ), "Passed!" );
});


QUnit.test( "expandByPoint" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	a.expandByPoint( zero3 );
	assert.ok( a.getSize().equals( zero3 ), "Passed!" );

	a.expandByPoint( one3 );
	assert.ok( a.getSize().equals( one3 ), "Passed!" );

	a.expandByPoint( one3.clone().negate() );
	assert.ok( a.getSize().equals( one3.clone().multiplyScalar( 2 ) ), "Passed!" );
	assert.ok( a.getCenter().equals( zero3 ), "Passed!" );
});

QUnit.test( "expandByVector" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	a.expandByVector( zero3 );
	assert.ok( a.getSize().equals( zero3 ), "Passed!" );

	a.expandByVector( one3 );
	assert.ok( a.getSize().equals( one3.clone().multiplyScalar( 2 ) ), "Passed!" );
	assert.ok( a.getCenter().equals( zero3 ), "Passed!" );
});

QUnit.test( "expandByScalar" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	a.expandByScalar( 0 );
	assert.ok( a.getSize().equals( zero3 ), "Passed!" );

	a.expandByScalar( 1 );
	assert.ok( a.getSize().equals( one3.clone().multiplyScalar( 2 ) ), "Passed!" );
	assert.ok( a.getCenter().equals( zero3 ), "Passed!" );
});

QUnit.test( "containsPoint" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );

	assert.ok( a.containsPoint( zero3 ), "Passed!" );
	assert.ok( ! a.containsPoint( one3 ), "Passed!" );

	a.expandByScalar( 1 );
	assert.ok( a.containsPoint( zero3 ), "Passed!" );
	assert.ok( a.containsPoint( one3 ), "Passed!" );
	assert.ok( a.containsPoint( one3.clone().negate() ), "Passed!" );
});

QUnit.test( "containsBox" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );

	assert.ok( a.containsBox( a ), "Passed!" );
	assert.ok( ! a.containsBox( b ), "Passed!" );
	assert.ok( ! a.containsBox( c ), "Passed!" );

	assert.ok( b.containsBox( a ), "Passed!" );
	assert.ok( c.containsBox( a ), "Passed!" );
	assert.ok( ! b.containsBox( c ), "Passed!" );
});

QUnit.test( "getParameter" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	var b = new THREE.Box3( one3.clone().negate(), one3.clone() );

	assert.ok( a.getParameter( new THREE.Vector3( 0, 0, 0 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	assert.ok( a.getParameter( new THREE.Vector3( 1, 1, 1 ) ).equals( new THREE.Vector3( 1, 1, 1 ) ), "Passed!" );

	assert.ok( b.getParameter( new THREE.Vector3( -1, -1, -1 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	assert.ok( b.getParameter( new THREE.Vector3( 0, 0, 0 ) ).equals( new THREE.Vector3( 0.5, 0.5, 0.5 ) ), "Passed!" );
	assert.ok( b.getParameter( new THREE.Vector3( 1, 1, 1 ) ).equals( new THREE.Vector3( 1, 1, 1 ) ), "Passed!" );
});

QUnit.test( "clampPoint" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( one3.clone().negate(), one3.clone() );

	assert.ok( a.clampPoint( new THREE.Vector3( 0, 0, 0 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	assert.ok( a.clampPoint( new THREE.Vector3( 1, 1, 1 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	assert.ok( a.clampPoint( new THREE.Vector3( -1, -1, -1 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );

	assert.ok( b.clampPoint( new THREE.Vector3( 2, 2, 2 ) ).equals( new THREE.Vector3( 1, 1, 1 ) ), "Passed!" );
	assert.ok( b.clampPoint( new THREE.Vector3( 1, 1, 1 ) ).equals( new THREE.Vector3( 1, 1, 1 ) ), "Passed!" );
	assert.ok( b.clampPoint( new THREE.Vector3( 0, 0, 0 ) ).equals( new THREE.Vector3( 0, 0, 0 ) ), "Passed!" );
	assert.ok( b.clampPoint( new THREE.Vector3( -1, -1, -1 ) ).equals( new THREE.Vector3( -1, -1, -1 ) ), "Passed!" );
	assert.ok( b.clampPoint( new THREE.Vector3( -2, -2, -2 ) ).equals( new THREE.Vector3( -1, -1, -1 ) ), "Passed!" );
});

QUnit.test( "distanceToPoint" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( one3.clone().negate(), one3.clone() );

	assert.ok( a.distanceToPoint( new THREE.Vector3( 0, 0, 0 ) ) == 0, "Passed!" );
	assert.ok( a.distanceToPoint( new THREE.Vector3( 1, 1, 1 ) ) == Math.sqrt( 3 ), "Passed!" );
	assert.ok( a.distanceToPoint( new THREE.Vector3( -1, -1, -1 ) ) == Math.sqrt( 3 ), "Passed!" );

	assert.ok( b.distanceToPoint( new THREE.Vector3( 2, 2, 2 ) ) == Math.sqrt( 3 ), "Passed!" );
	assert.ok( b.distanceToPoint( new THREE.Vector3( 1, 1, 1 ) ) == 0, "Passed!" );
	assert.ok( b.distanceToPoint( new THREE.Vector3( 0, 0, 0 ) ) == 0, "Passed!" );
	assert.ok( b.distanceToPoint( new THREE.Vector3( -1, -1, -1 ) ) == 0, "Passed!" );
	assert.ok( b.distanceToPoint( new THREE.Vector3( -2, -2, -2 ) ) == Math.sqrt( 3 ), "Passed!" );
});

QUnit.test( "distanceToPoint" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( one3.clone().negate(), one3.clone() );

	assert.ok( a.distanceToPoint( new THREE.Vector3( 0, 0, 0 ) ) == 0, "Passed!" );
	assert.ok( a.distanceToPoint( new THREE.Vector3( 1, 1, 1 ) ) == Math.sqrt( 3 ), "Passed!" );
	assert.ok( a.distanceToPoint( new THREE.Vector3( -1, -1, -1 ) ) == Math.sqrt( 3 ), "Passed!" );

	assert.ok( b.distanceToPoint( new THREE.Vector3( 2, 2, 2 ) ) == Math.sqrt( 3 ), "Passed!" );
	assert.ok( b.distanceToPoint( new THREE.Vector3( 1, 1, 1 ) ) == 0, "Passed!" );
	assert.ok( b.distanceToPoint( new THREE.Vector3( 0, 0, 0 ) ) == 0, "Passed!" );
	assert.ok( b.distanceToPoint( new THREE.Vector3( -1, -1, -1 ) ) == 0, "Passed!" );
	assert.ok( b.distanceToPoint( new THREE.Vector3( -2, -2, -2 ) ) == Math.sqrt( 3 ), "Passed!" );
});

QUnit.test( "intersectsBox" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );

	assert.ok( a.intersectsBox( a ), "Passed!" );
	assert.ok( a.intersectsBox( b ), "Passed!" );
	assert.ok( a.intersectsBox( c ), "Passed!" );

	assert.ok( b.intersectsBox( a ), "Passed!" );
	assert.ok( c.intersectsBox( a ), "Passed!" );
	assert.ok( b.intersectsBox( c ), "Passed!" );

	b.translate( new THREE.Vector3( 2, 2, 2 ) );
	assert.ok( ! a.intersectsBox( b ), "Passed!" );
	assert.ok( ! b.intersectsBox( a ), "Passed!" );
	assert.ok( ! b.intersectsBox( c ), "Passed!" );
});

QUnit.test( "intersectsSphere" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	var b = new THREE.Sphere( zero3.clone(), 1 );

	assert.ok( a.intersectsSphere( b ) , "Passed!" );

	b.translate( new THREE.Vector3( 2, 2, 2 ) );
	assert.ok( ! a.intersectsSphere( b ) , "Passed!" );
});

QUnit.test( "intersectsPlane" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	var b = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 1 );
	var c = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 1.25 );
	var d = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 1.25 );

	assert.ok( a.intersectsPlane( b ) , "Passed!" );
	assert.ok( ! a.intersectsPlane( c ) , "Passed!" );
	assert.ok( ! a.intersectsPlane( d ) , "Passed!" );
});

QUnit.test( "getBoundingSphere" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );

	assert.ok( a.getBoundingSphere().equals( new THREE.Sphere( zero3, 0 ) ), "Passed!" );
	assert.ok( b.getBoundingSphere().equals( new THREE.Sphere( one3.clone().multiplyScalar( 0.5 ), Math.sqrt( 3 ) * 0.5 ) ), "Passed!" );
	assert.ok( c.getBoundingSphere().equals( new THREE.Sphere( zero3, Math.sqrt( 12 ) * 0.5 ) ), "Passed!" );
});

QUnit.test( "intersect" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );

	assert.ok( a.clone().intersect( a ).equals( a ), "Passed!" );
	assert.ok( a.clone().intersect( b ).equals( a ), "Passed!" );
	assert.ok( b.clone().intersect( b ).equals( b ), "Passed!" );
	assert.ok( a.clone().intersect( c ).equals( a ), "Passed!" );
	assert.ok( b.clone().intersect( c ).equals( b ), "Passed!" );
	assert.ok( c.clone().intersect( c ).equals( c ), "Passed!" );
});

QUnit.test( "union" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );

	assert.ok( a.clone().union( a ).equals( a ), "Passed!" );
	assert.ok( a.clone().union( b ).equals( b ), "Passed!" );
	assert.ok( a.clone().union( c ).equals( c ), "Passed!" );
	assert.ok( b.clone().union( c ).equals( c ), "Passed!" );
});

var compareBox = function ( a, b, threshold ) {
	threshold = threshold || 0.0001;
	return ( a.min.distanceTo( b.min ) < threshold &&
	a.max.distanceTo( b.max ) < threshold );
};

QUnit.test( "applyMatrix4" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );
	var d = new THREE.Box3( one3.clone().negate(), zero3.clone() );

	var m = new THREE.Matrix4().makeTranslation( 1, -2, 1 );
	var t1 = new THREE.Vector3( 1, -2, 1 );

	assert.ok( compareBox( a.clone().applyMatrix4( m ), a.clone().translate( t1 ) ), "Passed!" );
	assert.ok( compareBox( b.clone().applyMatrix4( m ), b.clone().translate( t1 ) ), "Passed!" );
	assert.ok( compareBox( c.clone().applyMatrix4( m ), c.clone().translate( t1 ) ), "Passed!" );
	assert.ok( compareBox( d.clone().applyMatrix4( m ), d.clone().translate( t1 ) ), "Passed!" );
});

QUnit.test( "translate" , function( assert ) {
	var a = new THREE.Box3( zero3.clone(), zero3.clone() );
	var b = new THREE.Box3( zero3.clone(), one3.clone() );
	var c = new THREE.Box3( one3.clone().negate(), one3.clone() );
	var d = new THREE.Box3( one3.clone().negate(), zero3.clone() );

	assert.ok( a.clone().translate( one3 ).equals( new THREE.Box3( one3, one3 ) ), "Passed!" );
	assert.ok( a.clone().translate( one3 ).translate( one3.clone().negate() ).equals( a ), "Passed!" );
	assert.ok( d.clone().translate( one3 ).equals( b ), "Passed!" );
	assert.ok( b.clone().translate( one3.clone().negate() ).equals( d ), "Passed!" );
});

QUnit.test( "setFromCenterAndSize", function ( assert ) {

	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	var b = a.clone();
	var newCenter = one3;
	var newSize = two3;

	a.setFromCenterAndSize( a.getCenter(), a.getSize() );
	assert.ok( a.equals( b ), "Same values: no changes" );

	a.setFromCenterAndSize( newCenter, a.getSize() );
	assert.ok( a.getCenter().equals( newCenter ), "Move center: correct new center" );
	assert.ok( a.getSize().equals( b.getSize() ), "Move center: no change in size" );
	assert.notOk( a.equals( b ), "Move center: no longer equal to old values" );

	a.setFromCenterAndSize( a.getCenter(), newSize );
	assert.ok( a.getCenter().equals( newCenter ), "Resize: no change to center" );
	assert.ok( a.getSize().equals( newSize ), "Resize: correct new size" );
	assert.notOk( a.equals( b ), "Resize: no longer equal to old values" );

} );

QUnit.test( "setFromBufferAttribute", function ( assert ) {

	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	var bigger = new THREE.BufferAttribute( new Float32Array( [
		 - 2, - 2, - 2, 2, 2, 2, 1.5, 1.5, 1.5, 0, 0, 0
	] ), 3 );
	var smaller = new THREE.BufferAttribute( new Float32Array( [
		 - 0.5, - 0.5, - 0.5, 0.5, 0.5, 0.5, 0, 0, 0
	] ), 3 );
	var newMin = new THREE.Vector3( - 2, - 2, - 2 );
	var newMax = new THREE.Vector3( 2, 2, 2 );

	a.setFromBufferAttribute( bigger );
	assert.ok( a.min.equals( newMin ), "Bigger box: correct new minimum" );
	assert.ok( a.max.equals( newMax ), "Bigger box: correct new maximum" );

	newMin.set( - 0.5, - 0.5, - 0.5 );
	newMax.set( 0.5, 0.5, 0.5 );

	a.setFromBufferAttribute( smaller );
	assert.ok( a.min.equals( newMin ), "Smaller box: correct new minimum" );
	assert.ok( a.max.equals( newMax ), "Smaller box: correct new maximum" );

} );

QUnit.test( "expandByObject", function ( assert ) {

	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	var b = a.clone();
	var bigger = new THREE.Mesh( new THREE.BoxGeometry( 2, 2, 2 ) );
	var smaller = new THREE.Mesh( new THREE.BoxGeometry( 0.5, 0.5, 0.5 ) );
	var child = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ) );

	// just a bigger box to begin with
	a.expandByObject( bigger );
	assert.ok( a.min.equals( new THREE.Vector3( - 1, - 1, - 1 ) ), "Bigger box: correct new minimum" );
	assert.ok( a.max.equals( new THREE.Vector3( 1, 1, 1 ) ), "Bigger box: correct new maximum" );

	// a translated, bigger box
	a.copy( b );
	bigger.translateX( 2 );
	a.expandByObject( bigger );
	assert.ok( a.min.equals( new THREE.Vector3( 0, - 1, - 1 ) ), "Translated, bigger box: correct new minimum" );
	assert.ok( a.max.equals( new THREE.Vector3( 3, 1, 1 ) ), "Translated, bigger box: correct new maximum" );

	// a translated, bigger box with child
	a.copy( b );
	bigger.add( child );
	a.expandByObject( bigger );
	assert.ok( a.min.equals( new THREE.Vector3( 0, - 1, - 1 ) ), "Translated, bigger box with child: correct new minimum" );
	assert.ok( a.max.equals( new THREE.Vector3( 3, 1, 1 ) ), "Translated, bigger box with child: correct new maximum" );

	// a translated, bigger box with a translated child
	a.copy( b );
	child.translateX( 2 );
	a.expandByObject( bigger );
	assert.ok( a.min.equals( new THREE.Vector3( 0, - 1, - 1 ) ), "Translated, bigger box with translated child: correct new minimum" );
	assert.ok( a.max.equals( new THREE.Vector3( 4.5, 1, 1 ) ), "Translated, bigger box with translated child: correct new maximum" );

	// a smaller box
	a.copy( b );
	a.expandByObject( smaller );
	assert.ok( a.min.equals( new THREE.Vector3( - 0.25, - 0.25, - 0.25 ) ), "Smaller box: correct new minimum" );
	assert.ok( a.max.equals( new THREE.Vector3( 1, 1, 1 ) ), "Smaller box: correct new maximum" );

} );

QUnit.test( "setFromObject/BufferGeometry", function ( assert ) {

	var a = new THREE.Box3( zero3.clone(), one3.clone() );
	var object = new THREE.Mesh( new THREE.BoxBufferGeometry( 2, 2, 2 ) );
	var child = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1 ) );
	object.add( child );

	a.setFromObject( object );
	assert.ok( a.min.equals( new THREE.Vector3( - 1, - 1, - 1 ) ), "Correct new minimum" );
	assert.ok( a.max.equals( new THREE.Vector3( 1, 1, 1 ) ), "Correct new maximum" );

} );
