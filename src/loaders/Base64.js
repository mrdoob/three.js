/**
 * @author bhouston / http://exocortex.com/
 * @author gero3 / https://github.com/gero3/
 * Original source from: 2013, April 22: https://github.com/niklasvh/base64-arraybuffer (MIT-LICENSED)
 */

THREE.Base64 = function () {
};

THREE.Base64.base64EncodeLookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

THREE.Base64.base64DecodeLookup = function() {

  var base64DecodeLookupTable = new Uint8Array( new ArrayBuffer( 256 ) );

  for( var i = 0; i < THREE.Base64.base64EncodeLookup.length; i ++ ) {

    base64DecodeLookupTable[ THREE.Base64.base64EncodeLookup[ i ].charCodeAt( 0 ) ] = i;

  }

  return base64DecodeLookupTable;

}();

THREE.Base64.fromArrayBuffer = function ( arrayBuffer ) {

  var bytes = new Uint8Array( arrayBuffer );
  var base64 = "";
  var base64EncodeLookup = THREE.Base64.base64EncodeLookup;

  for ( var i = 0, il = bytes.length; i < il; i += 3 ) {
  
    base64 += base64EncodeLookup[bytes[i] >> 2];
    base64 += base64EncodeLookup[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64 += base64EncodeLookup[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64 += base64EncodeLookup[bytes[i + 2] & 63];

  }

  var byteLengthMod3 = bytes.length % 3;

  if ( byteLengthMod3 === 2 ) {

    base64 = base64.substring(0, base64.length - 1) + "=";

  } else if ( byteLengthMod3 === 1 ) {

    base64 = base64.substring(0, base64.length - 2) + "==";

  }

  return base64;

};

THREE.Base64.toArrayBuffer = function( base64 ) {

  var bufferLength = base64.length * 0.75;

  if (base64[base64.length - 1] === "=") {

    bufferLength --;

    if (base64[base64.length - 2] === "=") {

      bufferLength --;

    }

  }

  var base64DecodeLookup = THREE.Base64.base64DecodeLookup;

  var arrayBuffer = new ArrayBuffer( bufferLength );
  var bytes = new Uint8Array( arrayBuffer );

  for ( var i = 0, p = 0, il = base64.length; i < il; i += 4 ) {

    var encoded1 = base64DecodeLookup[base64.charCodeAt(i)];
    var encoded2 = base64DecodeLookup[base64.charCodeAt(i+1)];
    var encoded3 = base64DecodeLookup[base64.charCodeAt(i+2)];
    var encoded4 = base64DecodeLookup[base64.charCodeAt(i+3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);

  }

  return arrayBuffer;

};

THREE.Base64.fromArrayOfFloats = function( arrayOfFloats ) {

  var arrayBuffer = new ArrayBuffer( arrayOfFloats.length * 4 );
  var floatBuffer = new Float32Array( arrayBuffer );

  for( var i = 0, il = arrayOfFloats.length; i < il; i ++ ) {

    floatBuffer[i] = arrayOfFloats[i];

  }

  return THREE.Base64.fromArrayBuffer( arrayBuffer );

};

THREE.Base64.toArrayOfFloats = function( base64 ) {

  var arrayBuffer = THREE.Base64.toArrayBuffer( base64 );

  if( ( arrayBuffer.byteLength % 4 ) !== 0 ) {

    console.warn( "Base64.toArrayOfFloats(): incompatible byte length.")

  }

  var floatArray = new Float32Array( arrayBuffer );
  var arrayOfFloats = [];

  for( var i = 0, il = floatArray.length; i < il; i ++ ) {

    arrayOfFloats.push( floatArray[i] );

  }  

  return arrayOfFloats;

};

THREE.Base64.fromRaggedArrayOfIntegers = function( raggedArrayOfIntegers ) {

  var totalElementCount = 0;
  
  for( var i = 0, il = raggedArrayOfIntegers.length; i < il; i ++ ) {

    totalElementCount += raggedArrayOfIntegers[i].length + 1;

  }

  var arrayBuffer = new ArrayBuffer( totalElementCount * 4 );
  var intBuffer = new Int32Array( arrayBuffer );

  var j = 0;
  for( var i = 0, il = raggedArrayOfIntegers.length; i < il; i ++ ) {

    var subArray = raggedArrayOfIntegers[i];

    intBuffer[j++] = subArray.length;

    for( var k = 0, kl = subArray.length; k < kl; k ++ ) {

      intBuffer[j++] = subArray[k];

    }

  }

  return THREE.Base64.fromArrayBuffer( arrayBuffer );


};

THREE.Base64.toRaggedArrayOfIntegers = function( base64 ) {

  var arrayBuffer = THREE.Base64.toArrayBuffer( base64 );

  if( ( arrayBuffer.byteLength % 4 ) !== 0 ) {

    console.warn( "Base64.toArrayOfFloats(): incompatible byte length.")

  }

  var intArray = new Int32Array( arrayBuffer );
  var raggedArrayOfIntegers = [];

  for( var i = 0, il = intArray.length; i < il; ) {

    var subElementCount = intArray[i ++];

    var subArray = [];

    for( var j = 0; j < subElementCount; j ++ ) {
      subArray.push( intArray[ i ++ ] );
    }

    raggedArrayOfIntegers.push( subArray );

  }  

  return raggedArrayOfIntegers;

};

THREE.Base64.fromArrayOfIntegers = function( arrayOfIntegers ) {

  var arrayBuffer = new ArrayBuffer( arrayOfIntegers.length * 4 );
  var intBuffer = new Int32Array( arrayBuffer );

  for( var i = 0, il = arrayOfIntegers.length; i < il; i ++ ) {

    intBuffer[i] = arrayOfIntegers[i];

  }

  return THREE.Base64.fromArrayBuffer( arrayBuffer );

};

THREE.Base64.toArrayOfIntegers = function( base64 ) {

  var arrayBuffer = THREE.Base64.toArrayBuffer( base64 );

  if( ( arrayBuffer.byteLength % 4 ) !== 0 ) {

    console.warn( "Base64.toArrayOfIntegers(): incompatible byte length.")

  }

  var intArray = new Int32Array( arrayBuffer );
  var arrayOfIntegers = [];

  for( var i = 0, il = intArray.length; i < il; i ++ ) {

    arrayOfIntegers.push( intArray[i] );

  }  

  return arrayOfIntegers;

};

THREE.Base64.fromArrayOfVector2 = function( arrayOfVector2 ) {

  var arrayBuffer = new ArrayBuffer( arrayOfVector2.length * 8 );
  var floatBuffer = new Float32Array( arrayBuffer );

  for( var i = 0, j = 0, il = arrayOfVector2.length; i < il; i ++, j += 2 ) {

    var v = arrayOfVector2[i];

    floatBuffer[j] = v.x;
    floatBuffer[j+1] = v.y;
    
  }

  return THREE.Base64.fromArrayBuffer( arrayBuffer );

};

THREE.Base64.toArrayOfVector2 = function( base64 ) {

  var arrayBuffer = THREE.Base64.toArrayBuffer( base64 );

  if( ( arrayBuffer.byteLength % 8 ) !== 0 ) {

    console.warn( "Base64.toArrayOfVector2(): incompatible byte length.")

  }

  var floatArray = new Float32Array( arrayBuffer );
  var arrayOfVector2 = [];

  for( var i = 0, il = floatArray.length; i < il; i += 2 ) {
    arrayOfVector2.push( new THREE.Vector2( floatArray[i], floatArray[i+1] ) );
  }  

  return arrayOfVector2;

};

THREE.Base64.fromArrayOfVector3 = function( arrayOfVector3 ) {

  var arrayBuffer = new ArrayBuffer( arrayOfVector3.length * 12 );
  var floatBuffer = new Float32Array( arrayBuffer );

  for( var i = 0, j = 0, il = arrayOfVector3.length; i < il; i ++, j += 3 ) {

    var v = arrayOfVector3[i];
    
    floatBuffer[j] = v.x;
    floatBuffer[j+1] = v.y;
    floatBuffer[j+2] = v.z;
    
  }

  return THREE.Base64.fromArrayBuffer( arrayBuffer );

};

THREE.Base64.toArrayOfVector3 = function( base64 ) {

  var arrayBuffer = THREE.Base64.toArrayBuffer( base64 );

  if( ( arrayBuffer.byteLength % 12 ) !== 0 ) {

    console.warn( "Base64.toArrayOfVector3(): incompatible byte length.")

  }

  var floatArray = new Float32Array( arrayBuffer );
  var arrayOfVector3 = [];

  for( var i = 0, il = floatArray.length; i < il; i += 3 ) {

    arrayOfVector3.push( new THREE.Vector3( floatArray[i], floatArray[i+1], floatArray[i+2] ) );

  }  

  return arrayOfVector3;

};
