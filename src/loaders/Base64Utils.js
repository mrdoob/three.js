/**
 * @author bhouston / http://exocortex.com/
 * Original source from: 2013, April 22: https://github.com/niklasvh/base64-arraybuffer (MIT-LICENSED)
 */

THREE.Base64Utils = function () {
};

// Converts an ArrayBuffer directly to base64, without any intermediate 'convert to string then
// use window.btoa' step. According to my tests, this appears to be a faster approach:
// http://jsperf.com/encoding-xhr-image-data/5
// source: https://gist.github.com/jonleighton/958841
THREE.Base64Utils.arrayBufferToBase64 = function (arraybuffer) {
  var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.buffer.byteLength, base64 = "";

  for (i = 0; i < len; i+=3) {
    base64 += THREE.Base64Utils._keyStr[bytes[i] >> 2];
    base64 += THREE.Base64Utils._keyStr[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64 += THREE.Base64Utils._keyStr[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64 += THREE.Base64Utils._keyStr[bytes[i + 2] & 63];
  }

  if ((len % 3) === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }

  return base64;
};

THREE.Base64Utils._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

THREE.Base64Utils.base64ToArrayBuffer = function(base64) {
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
      encoded1 = THREE.Base64Utils._keyStr.indexOf(base64[i]);
      encoded2 = THREE.Base64Utils._keyStr.indexOf(base64[i+1]);
      encoded3 = THREE.Base64Utils._keyStr.indexOf(base64[i+2]);
      encoded4 = THREE.Base64Utils._keyStr.indexOf(base64[i+3]);

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
};