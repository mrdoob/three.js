/*
 * @author bhouston / http://exocortex.com
 */

module( "Base64" );

test( "Individual Byte Encode/Decode", function() {

	for( var i = 0; i < THREE.Base64.base64EncodeLookup.length; i ++ ) {
		var a = THREE.Base64.base64EncodeLookup.indexOf( THREE.Base64.base64EncodeLookup[i] );
		var b = THREE.Base64.base64DecodeLookup[ THREE.Base64.base64EncodeLookup.charCodeAt(i) ];
		ok( a === b, "Passed!" );
	}	

});

test( "Float32Array Encode/Decode", function() {

	var originalArrayBuffer = new ArrayBuffer( 5 * 4 );
	var originalFloat32Buffer = new Float32Array( originalArrayBuffer );

	for( var i = 0; i < 5; i ++ ) {
		originalFloat32Buffer[i] = 0.2454 * i + 0.2;
	}

	var base64Encode = THREE.Base64.fromArrayBuffer( originalArrayBuffer );
	var newArrayBuffer = THREE.Base64.toArrayBuffer( base64Encode );	
	var newFloat32Buffer = new Float32Array( newArrayBuffer );

	ok( newArrayBuffer.byteLength == originalArrayBuffer.byteLength, "Passed!" );
	ok( originalFloat32Buffer.length == newFloat32Buffer.length, "Passed!" );

	for( var i = 0; i < 5; i ++ ) {
		ok( originalFloat32Buffer[i] == newFloat32Buffer[i], "Passed!" );
	}

});

test( "Array of Integer Encode/Decode", function() {

	var arrayOfIntegers = [];

	for( var i = 0; i < 10; i ++ ) {
		arrayOfIntegers.push( Math.round( Math.random() * 1000000 ) );
	}

	var base64 = THREE.Base64.fromArrayOfIntegers( arrayOfIntegers );
	var arrayOfIntegers_decoded = THREE.Base64.toArrayOfIntegers( base64 );

	ok( arrayOfIntegers.length == arrayOfIntegers_decoded.length, "Passed!" );

	for( var i = 0; i < arrayOfIntegers.length; i ++ ) {
		ok( arrayOfIntegers[i] === arrayOfIntegers_decoded[i], "Passed!" );
	}

});

test( "Ragged Array of Integer Encode/Decode", function() {

	var raggedArrayOfIntegers = [];

	for( var j = 0; j < 10; j ++ ) {
		var subArray = [];
		for( var i = 0; i < j+1; i ++ ) {
			subArray.push( Math.round( Math.random() * 1000000 ) );
		}
		raggedArrayOfIntegers.push( subArray );
	}

	var base64 = THREE.Base64.fromRaggedArrayOfIntegers( raggedArrayOfIntegers );
	var raggedArrayOfIntegers_decoded = THREE.Base64.toRaggedArrayOfIntegers( base64 );

	ok( raggedArrayOfIntegers.length == raggedArrayOfIntegers_decoded.length, "Passed!" );

	for( var i = 0; i < raggedArrayOfIntegers.length; i ++ ) {
		var subArray = raggedArrayOfIntegers[i];
		var subArray_decoded = raggedArrayOfIntegers_decoded[i];

		ok( subArray.length === subArray_decoded.length, "Passed!" );

		for( var i = 0; i < subArray.length; i ++ ) {
			ok( subArray[i] === subArray_decoded[i], "Passed!" );
		}
	}

});

test( "Array of Floats Encode/Decode", function() {

	var arrayOfFloats = [];

	for( var i = 0; i < 10; i ++ ) {
		arrayOfFloats.push( Math.random() );
	}

	var base64 = THREE.Base64.fromArrayOfFloats( arrayOfFloats );
	var arrayOfFloats_decoded = THREE.Base64.toArrayOfFloats( base64 );

	ok( arrayOfFloats.length == arrayOfFloats_decoded.length, "Passed!" );

	for( var i = 0; i < arrayOfFloats.length; i ++ ) {
		ok( Math.abs( 1 - arrayOfFloats[i] / arrayOfFloats_decoded[i] ) < 0.0001, "Passed!" );
	}

});

test( "Array of Vector2 Encode/Decode", function() {

	var arrayOfVector2 = [];

	for( var i = 0; i < 10; i ++ ) {
		arrayOfVector2.push( new THREE.Vector2( Math.random(), Math.random() ) );
	}

	var base64 = THREE.Base64.fromArrayOfVector2( arrayOfVector2 );
	var arrayOfVector2_decoded = THREE.Base64.toArrayOfVector2( base64 );

	ok( arrayOfVector2.length == arrayOfVector2_decoded.length, "Passed!" );

	for( var i = 0; i < arrayOfVector2.length; i ++ ) {
		ok( arrayOfVector2[i].distanceTo( arrayOfVector2_decoded[i] ) < 0.0001, "Passed!" );
	}

});

test( "Array of Vector3 Encode/Decode", function() {

	var arrayOfVector3 = [];

	for( var i = 0; i < 10; i ++ ) {
		arrayOfVector3.push( new THREE.Vector3( Math.random(), Math.random(), Math.random() ) );
	}

	var base64 = THREE.Base64.fromArrayOfVector3( arrayOfVector3 );
	var arrayOfVector3_decoded = THREE.Base64.toArrayOfVector3( base64 );

	ok( arrayOfVector3.length == arrayOfVector3_decoded.length, "Passed!" );

	for( var i = 0; i < arrayOfVector3.length; i ++ ) {
		ok( arrayOfVector3[i].distanceTo( arrayOfVector3_decoded[i] ) < 0.0001, "Passed!" );
	}

});