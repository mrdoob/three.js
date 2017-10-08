/**
 * @author simonThiele / https://github.com/simonThiele
 */

QUnit.module( "BufferAttribute" );

QUnit.test( "count" , function( assert ) {
	assert.ok(
		new THREE.BufferAttribute( new Float32Array( [1, 2, 3, 4, 5, 6] ), 3 ).count === 2,
		'count is equal to the number of chunks'
	);
});

QUnit.test( "copy" , function( assert ) {
	var attr = new THREE.BufferAttribute( new Float32Array( [1, 2, 3, 4, 5, 6] ), 3 );
	attr.setDynamic( true );
	attr.needsUpdate = true;

	var attrCopy = new THREE.BufferAttribute().copy( attr );

	assert.ok( attr.count === attrCopy.count, 'count is equal' );
	assert.ok( attr.itemSize === attrCopy.itemSize, 'itemSize is equal' );
	assert.ok( attr.dynamic === attrCopy.dynamic, 'dynamic is equal' );
	assert.ok( attr.array.length === attrCopy.array.length, 'array length is equal' );
	assert.ok( attr.version === 1 && attrCopy.version === 0, 'version is not copied which is good' );
});

QUnit.test( "copyAt" , function( assert ) {
	var attr = new THREE.BufferAttribute( new Float32Array( [1, 2, 3, 4, 5, 6, 7, 8, 9] ), 3 );
	var attr2 = new THREE.BufferAttribute( new Float32Array(9), 3 );

	attr2.copyAt( 1, attr, 2 );
	attr2.copyAt( 0, attr, 1 );
	attr2.copyAt( 2, attr, 0 );

	var i = attr.array;
	var i2 = attr2.array; // should be [4, 5, 6, 7, 8, 9, 1, 2, 3]

	assert.ok( i2[0] === i[3] && i2[1] === i[4] && i2[2] === i[5], 'chunck copied to correct place' );
	assert.ok( i2[3] === i[6] && i2[4] === i[7] && i2[5] === i[8], 'chunck copied to correct place' );
	assert.ok( i2[6] === i[0] && i2[7] === i[1] && i2[8] === i[2], 'chunck copied to correct place' );
});

QUnit.test( "copyColorsArray" , function( assert ) {
	var attr = new THREE.BufferAttribute( new Float32Array(6), 3 );

	attr.copyColorsArray( [
		new THREE.Color( 0, 0.5, 1 ),
		new THREE.Color( 0.25, 1, 0 )
	]);

	var i = attr.array;
	assert.ok( i[0] === 0 && i[1] === 0.5 && i[2] === 1, 'first color was copied correctly' );
	assert.ok( i[3] === 0.25 && i[4] === 1 && i[5] === 0, 'second color was copied correctly' );
});

QUnit.test( "copyIndicesArray" , function( assert ) {
	var attr = new THREE.BufferAttribute( new Float32Array(6), 3 );

	attr.copyIndicesArray( [
		{a: 1, b: 2, c: 3},
		{a: 4, b: 5, c: 6}
	]);

	var i = attr.array;
	assert.ok( i[0] === 1 && i[1] === 2 && i[2] === 3, 'first indices were copied correctly' );
	assert.ok( i[3] === 4 && i[4] === 5 && i[5] === 6, 'second indices were copied correctly' );
});

QUnit.test( "copyVector2sArray" , function( assert ) {
	var attr = new THREE.BufferAttribute( new Float32Array(4), 2 );

	attr.copyVector2sArray( [
		new THREE.Vector2(1, 2),
		new THREE.Vector2(4, 5)
	]);

	var i = attr.array;
	assert.ok( i[0] === 1 && i[1] === 2, 'first vector was copied correctly' );
	assert.ok( i[2] === 4 && i[3] === 5, 'second vector was copied correctly' );
});

QUnit.test( "copyVector3sArray" , function( assert ) {
	var attr = new THREE.BufferAttribute( new Float32Array(6), 2 );

	attr.copyVector3sArray( [
		new THREE.Vector3(1, 2, 3),
		new THREE.Vector3(10, 20, 30)
	]);

	var i = attr.array;
	assert.ok( i[0] === 1 && i[1] === 2 && i[2] === 3, 'first vector was copied correctly' );
	assert.ok( i[3] === 10 && i[4] === 20 && i[5] === 30, 'second vector was copied correctly' );
});

QUnit.test( "copyVector4sArray" , function( assert ) {
	var attr = new THREE.BufferAttribute( new Float32Array(8), 2 );

	attr.copyVector4sArray( [
		new THREE.Vector4(1, 2, 3, 4),
		new THREE.Vector4(10, 20, 30, 40)
	]);

	var i = attr.array;
	assert.ok( i[0] === 1 && i[1] === 2 && i[2] === 3 && i[3] === 4, 'first vector was copied correctly' );
	assert.ok( i[4] === 10 && i[5] === 20 && i[6] === 30 && i[7] === 40, 'second vector was copied correctly' );
});

QUnit.test( "clone" , function( assert ) {
	var attr = new THREE.BufferAttribute( new Float32Array([1, 2, 3, 4, 0.12, -12]), 2 );
	var attrCopy = attr.clone();

	assert.ok( attr.array.length === attrCopy.array.length, 'attribute was cloned' );
	for ( var i = 0; i < attr.array.length; i++ ) {
		assert.ok( attr.array[i] === attrCopy.array[i], 'array item is equal' );
	}
});

QUnit.test( "constructor exception", function ( assert ) {

	assert.throws(
		function () {

			var a = new THREE.BufferAttribute( [ 1, 2, 3, 4 ], 2, false );

		},
		/array should be a Typed Array/,
		"Calling constructor with a simple array throws Error"
	);

} );

QUnit.test( "setArray", function ( assert ) {

	var f32a = new Float32Array( [ 1, 2, 3, 4 ] );
	var a = new THREE.BufferAttribute( f32a, 2, false );

	a.setArray( f32a, 2 );

	assert.strictEqual( a.count, 2, "Check item count" );
	assert.strictEqual( a.array, f32a, "Check array" );

	assert.throws(
		function () {

			a.setArray( [ 1, 2, 3, 4 ] );

		},
		/array should be a Typed Array/,
		"Calling setArray with a simple array throws Error"
	);

} );

QUnit.test( "copyArray", function ( assert ) {

	var f32a = new Float32Array( [ 5, 6, 7, 8 ] );
	var a = new THREE.BufferAttribute( new Float32Array( [ 1, 2, 3, 4 ] ), 2, false );

	a.copyArray( f32a );

	assert.deepEqual( a.array, f32a, "Check array has new values" );

} );

QUnit.test( "set", function ( assert ) {

	var f32a = new Float32Array( [ 1, 2, 3, 4 ] );
	var a = new THREE.BufferAttribute( f32a, 2, false );
	var expected = new Float32Array( [ 9, 2, 8, 4 ] );

	a.set( [ 9 ] );
	a.set( [ 8 ], 2 );

	assert.deepEqual( a.array, expected, "Check array has expected values" );

} );

QUnit.test( "set[X, Y, Z, W, XYZ, XYZW]/get[X, Y, Z, W]", function ( assert ) {

	var f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	var a = new THREE.BufferAttribute( f32a, 4, false );
	var expected = new Float32Array( [ 1, 2, - 3, - 4, - 5, - 6, 7, 8 ] );

	a.setX( 1, a.getX( 1 ) * - 1 );
	a.setY( 1, a.getY( 1 ) * - 1 );
	a.setZ( 0, a.getZ( 0 ) * - 1 );
	a.setW( 0, a.getW( 0 ) * - 1 );

	assert.deepEqual( a.array, expected, "Check all set* calls set the correct values" );

} );

QUnit.test( "setXY", function ( assert ) {

	var f32a = new Float32Array( [ 1, 2, 3, 4 ] );
	var a = new THREE.BufferAttribute( f32a, 2, false );
	var expected = new Float32Array( [ - 1, - 2, 3, 4 ] );

	a.setXY( 0, - 1, - 2 );

	assert.deepEqual( a.array, expected, "Check for the correct values" );

} );

QUnit.test( "setXYZ", function ( assert ) {

	var f32a = new Float32Array( [ 1, 2, 3, 4, 5, 6 ] );
	var a = new THREE.BufferAttribute( f32a, 3, false );
	var expected = new Float32Array( [ 1, 2, 3, - 4, - 5, - 6 ] );

	a.setXYZ( 1, - 4, - 5, - 6 );

	assert.deepEqual( a.array, expected, "Check for the correct values" );

} );

QUnit.test( "setXYZW", function ( assert ) {

	var f32a = new Float32Array( [ 1, 2, 3, 4 ] );
	var a = new THREE.BufferAttribute( f32a, 4, false );
	var expected = new Float32Array( [ - 1, - 2, - 3, - 4 ] );

	a.setXYZW( 0, - 1, - 2, - 3, - 4 );

	assert.deepEqual( a.array, expected, "Check for the correct values" );

} );

QUnit.test( "onUpload", function ( assert ) {

	var a = new THREE.BufferAttribute();
	var func = function () { };

	a.onUpload( func );

	assert.strictEqual( a.onUploadCallback, func, "Check callback was set properly" );

} );
