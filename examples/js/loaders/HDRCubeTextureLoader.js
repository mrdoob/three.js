/**
* @author Prashant Sharma / spidersharma03
* @author Ben Houston / http://clara.io / bhouston
*/

THREE.HDRCubeTextureLoader = function (manager) {
  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
  // override in sub classes
  this.hdrLoader = new THREE.RGBELoader();

  if( THREE.Encodings === undefined ) throw new Error( "HDRCubeMapLoader requires THREE.Encodings" );
}

THREE.HDRCubeTextureLoader.prototype.load = function(type, urls, onLoad, onProgress, onError) {
  var texture = new THREE.CubeTexture( [] );

  texture.type = type;
  texture.encoding = (type === THREE.UnsignedByteType) ? THREE.RGBEEncoding : THREE.LinearEncoding;
  texture.format = (type === THREE.UnsignedByteType ) ? THREE.RGBAFormat : THREE.RGBFormat;
  texture.minFilter = (texture.encoding === THREE.RGBEEncoding ) ? THREE.NearestFilter : THREE.LinearFilter;
  texture.magFilter = (texture.encoding === THREE.RGBEEncoding ) ? THREE.NearestFilter : THREE.LinearFilter;
  texture.generateMipmaps = (texture.encoding !== THREE.RGBEEncoding );
  texture.anisotropy = 0;

  var scope = this.hdrLoader;

  var loaded = 0;

  function loadHDRData(i, onLoad, onProgress, onError) {
    var loader = new THREE.XHRLoader( this.manager );
    loader.setResponseType( 'arraybuffer' );

    loader.load( urls[i], function ( buffer ) {
      loaded++;

      var texData = scope._parser( buffer );

      if ( ! texData ) return;

      if(type === THREE.FloatType) {
        var numElements = ( texData.data.length / 4 )*3;
        var floatdata = new Float32Array( numElements );
        for( var j=0; j<numElements; j++) {
          THREE.Encodings.RGBEByteToRGBFloat( texData.data, j*4, floatdata, j*3 );
        }
        texData.data = floatdata;
      }
      else if(type === THREE.HalfFloatType) {
        var numElements = ( texData.data.length / 4 )*3;
        var halfdata = new Uint16Array( numElements );
        for( var j=0; j<numElements; j++) {
          THREE.Encodings.RGBEByteToRGBHalf( texData.data, j*4, halfdata, j*3 );
        }
        texData.data = halfdata;
      }

      if ( undefined !== texData.image ) {
        texture[i].images = texData.image;
      }
      else if ( undefined !== texData.data ) {
        var dataTexture = new THREE.DataTexture(texData.data, texData.width, texData.height);
        dataTexture.format = texture.format;
        dataTexture.type = texture.type;
        dataTexture.encoding = texture.encoding;
        dataTexture.minFilter = texture.minFilter;
        dataTexture.magFilter = texture.magFilter;
        dataTexture.generateMipmaps = texture.generateMipmaps;

        texture.images[i] = dataTexture;
      }

      if(loaded === 6) {
        texture.needsUpdate = true;
        if ( onLoad ) onLoad( texture );
      }
    }, onProgress, onError );
  }

  for(var i=0; i<urls.length; i++) {
    loadHDRData(i, onLoad, onProgress, onError);
  }
  return texture;
};
