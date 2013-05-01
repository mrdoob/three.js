/**
 * @author bhouston / http://exocortex.com/
 * Original source from: 2013, April 22: https://github.com/niklasvh/base64-arraybuffer (MIT-LICENSED)
 */

THREE.Base64 = function () {
};

THREE.Base64.base64String = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

THREE.Base64.base64DecodeLookup = function() {

  var coreArrayBuffer = new ArrayBuffer( 256 );
  var base64DecodeLookupTable = new Uint8Array( coreArrayBuffer );
  for( var i = 0; i < THREE.Base64.base64String.length; i ++ ) {
    base64DecodeLookupTable[ THREE.Base64.base64String[ i ].charCodeAt( 0 ) ] = i;
  }

  return base64DecodeLookupTable;

}();

THREE.Base64.fromArrayBuffer = function (arraybuffer) {
  var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.buffer.byteLength, base64 = "";

  for (i = 0; i < len; i+=3) {
    base64 += (
        THREE.Base64.base64String[bytes[i] >> 2] +
        THREE.Base64.base64String[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)] +
        THREE.Base64.base64String[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)] +
        THREE.Base64.base64String[bytes[i + 2] & 63]
      );
  }

  if ((len % 3) === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }

  return base64;
};

THREE.Base64.toArrayBuffer = function() {

  var base64DecodeLookup = THREE.Base64.base64DecodeLookup;

  return function(base64) {

    var bufferLength = base64.length * 0.75,
      len = base64.length, i, p = 0,
      encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = base64DecodeLookup[base64.charCodeAt(i)];
      encoded2 = base64DecodeLookup[base64.charCodeAt(i+1)];
      encoded3 = base64DecodeLookup[base64.charCodeAt(i+2)];
      encoded4 = base64DecodeLookup[base64.charCodeAt(i+3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };

}();

THREE.Base64.toArrayOfFloats = function( base64 ) {

  var arrayBuffer = THREE.Base64.toArrayBuffer( base64 );
  var floatArray = new Float32Array( arrayBuffer );

  var arrayOfFloats = [];
  for( var i = 0, il = floatArray.length; i < il; i ++ ) {
    arrayOfFloats.push( floatArray[i] );
  }  

  return arrayOfFloats;

};