/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "BufferAttribute" );

test( "count", function() {
	ok(
		new THREE.BufferAttribute( new Float32Array( [1, 2, 3, 4, 5, 6] ), 3 ).count === 2,
		'count is equal to the number of chunks'
	);
});

test( "copy", function() {
	var attr = new THREE.BufferAttribute( new Float32Array( [1, 2, 3, 4, 5, 6] ), 3 );
	attr.setDynamic( true );
	attr.needsUpdate = true;

	var attrCopy = new THREE.BufferAttribute().copy( attr );

	ok( attr.count === attrCopy.count, 'count is equal' );
	ok( attr.itemSize === attrCopy.itemSize, 'itemSize is equal' );
	ok( attr.dynamic === attrCopy.dynamic, 'dynamic is equal' );
	ok( attr.array.length === attrCopy.array.length, 'array length is equal' );
	ok( attr.version === 1 && attrCopy.version === 0, 'version is not copied which is good' );
});

test( "copyAt", function() {
	var attr = new THREE.BufferAttribute( new Float32Array( [1, 2, 3, 4, 5, 6, 7, 8, 9] ), 3 );
	var attr2 = new THREE.BufferAttribute( new Float32Array(9), 3 );

	attr2.copyAt( 1, attr, 2 );
	attr2.copyAt( 0, attr, 1 );
	attr2.copyAt( 2, attr, 0 );

	var i = attr.array;
	var i2 = attr2.array; // should be [4, 5, 6, 7, 8, 9, 1, 2, 3]

	ok( i2[0] === i[3] && i2[1] === i[4] && i2[2] === i[5], 'chunck copied to correct place' );
	ok( i2[3] === i[6] && i2[4] === i[7] && i2[5] === i[8], 'chunck copied to correct place' );
	ok( i2[6] === i[0] && i2[7] === i[1] && i2[8] === i[2], 'chunck copied to correct place' );
});

test( "copyColorsArray", function() {
	var attr = new THREE.BufferAttribute( new Float32Array(6), 3 );

	attr.copyColorsArray( [
		new THREE.Color( 0, 0.5, 1 ),
		new THREE.Color( 0.25, 1, 0 )
	]);

	var i = attr.array;
	ok( i[0] === 0 && i[1] === 0.5 && i[2] === 1, 'first color was copied correctly' );
	ok( i[3] === 0.25 && i[4] === 1 && i[5] === 0, 'second color was copied correctly' );
});

test( "copyIndicesArray", function() {
	var attr = new THREE.BufferAttribute( new Float32Array(6), 3 );

	attr.copyIndicesArray( [
		{a: 1, b: 2, c: 3},
		{a: 4, b: 5, c: 6}
	]);

	var i = attr.array;
	ok( i[0] === 1 && i[1] === 2 && i[2] === 3, 'first indices were copied correctly' );
	ok( i[3] === 4 && i[4] === 5 && i[5] === 6, 'second indices were copied correctly' );
});

test( "copyVector2sArray", function() {
	var attr = new THREE.BufferAttribute( new Float32Array(4), 2 );

	attr.copyVector2sArray( [
		new THREE.Vector2(1, 2),
		new THREE.Vector2(4, 5)
	]);

	var i = attr.array;
	ok( i[0] === 1 && i[1] === 2, 'first vector was copied correctly' );
	ok( i[2] === 4 && i[3] === 5, 'second vector was copied correctly' );
});

test( "copyVector3sArray", function() {
	var attr = new THREE.BufferAttribute( new Float32Array(6), 2 );

	attr.copyVector3sArray( [
		new THREE.Vector3(1, 2, 3),
		new THREE.Vector3(10, 20, 30)
	]);

	var i = attr.array;
	ok( i[0] === 1 && i[1] === 2 && i[2] === 3, 'first vector was copied correctly' );
	ok( i[3] === 10 && i[4] === 20 && i[5] === 30, 'second vector was copied correctly' );
});

test( "copyVector4sArray", function() {
	var attr = new THREE.BufferAttribute( new Float32Array(8), 2 );

	attr.copyVector4sArray( [
		new THREE.Vector4(1, 2, 3, 4),
		new THREE.Vector4(10, 20, 30, 40)
	]);

	var i = attr.array;
	ok( i[0] === 1 && i[1] === 2 && i[2] === 3 && i[3] === 4, 'first vector was copied correctly' );
	ok( i[4] === 10 && i[5] === 20 && i[6] === 30 && i[7] === 40, 'second vector was copied correctly' );
});

test( "clone", function() {
	var attr = new THREE.BufferAttribute( new Float32Array([1, 2, 3, 4, 0.12, -12]), 2 );
	var attrCopy = attr.clone();

	ok( attr.array.length === attrCopy.array.length, 'attribute was cloned' );
	for ( var i = 0; i < attr.array.length; i++ ) {
		ok( attr.array[i] === attrCopy.array[i], 'array item is equal' );
	}
});
