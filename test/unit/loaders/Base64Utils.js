/**
 * @author bhouston / http://exocortex.com
 */

module( "Base64Utils" );

test( "base64ToIndex", function() {
	for( var i = 0; i < THREE.Base64Utils._keyStr.length; i ++ ) {
		var c = THREE.Base64Utils._keyStr.charCodeAt(i);
		var a = THREE.Base64Utils.base64ToIndexSlow( THREE.Base64Utils._keyStr[i] );
		var b = THREE.Base64Utils.base64ToIndex( c );
		console.log( a );
		console.log( b );
		ok( a === b, "Passed!" );
	}	
});


test( "Float32Array Base64 Encode/Decode", function() {
	var originalArrayBuffer = new ArrayBuffer( 5 * 4 );
	var originalFloat32Buffer = new Float32Array( originalArrayBuffer );
	for( var i = 0; i < 5; i ++ ) {
		originalFloat32Buffer[i] = 0.2454 * i + 0.2;
	}
	var base64Encode = THREE.Base64Utils.arrayBufferToBase64( originalArrayBuffer );

	var newArrayBuffer = THREE.Base64Utils.base64ToArrayBuffer( base64Encode );	

	var newFloat32Buffer = new Float32Array( newArrayBuffer );

	ok( newArrayBuffer.byteLength == originalArrayBuffer.byteLength, "Passed!" );
	ok( originalFloat32Buffer.length == newFloat32Buffer.length, "Passed!" );

	for( var i = 0; i < 5; i ++ ) {
		ok( originalFloat32Buffer[i] == newFloat32Buffer[i], "Passed!" );
	}
});

