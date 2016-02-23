/**
 * @author Prashant Sharma / spidersharma03
 */

 var toHalf = (function() {
   var floatView = new Float32Array(1);
   var int32View = new Int32Array(floatView.buffer);

   /* This method is faster than the OpenEXR implementation (very often
    * used, eg. in Ogre), with the additional benefit of rounding, inspired
    * by James Tursa?s half-precision code. */
   return function toHalf(val) {

     floatView[0] = val;
     var x = int32View[0];

     var bits = (x >> 16) & 0x8000; /* Get the sign */
     var m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */
     var e = (x >> 23) & 0xff; /* Using int is faster here */

     /* If zero, or denormal, or exponent underflows too much for a denormal
      * half, return signed zero. */
     if (e < 103) {
       return bits;
     }

     /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
     if (e > 142) {
       bits |= 0x7c00;
       /* If exponent was 0xff and one mantissa bit was set, it means NaN,
            * not Inf, so make sure we set one mantissa bit too. */
       bits |= ((e == 255) ? 0 : 1) && (x & 0x007fffff);
       return bits;
     }

     /* If exponent underflows but not too much, return a denormal */
     if (e < 113) {
       m |= 0x0800;
       /* Extra rounding may overflow and set mantissa to 0 and exponent
        * to 1, which is OK. */
       bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
       return bits;
     }

     bits |= ((e - 112) << 10) | (m >> 1);
     /* Extra rounding. An overflow will set mantissa to 0 and increment
      * the exponent, which is OK. */
     bits += m & 1;
     return bits;
   };
 }());

THREE.HDRCubeMapLoader = function (manager) {
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
    // override in sub classes
    this.hdrLoader = new THREE.RGBELoader();
}

THREE.HDRCubeMapLoader.prototype.load = function(type, urls, onLoad, onProgress, onError) {
    var texture = new THREE.CubeTexture( [] );
    type = (type === undefined) ? THREE.UnsignedByteType : type;
    texture.encoding = THREE.Linear;
    if(type === THREE.UnsignedByteType)
        texture.encoding = THREE.RGBE;
    var scope = this.hdrLoader;

    var loaded = 0;

     function loadHDRData(i, onLoad, onProgress, onError) {
        var loader = new THREE.XHRLoader( this.manager );
        loader.setResponseType( 'arraybuffer' );

        loader.load( urls[i], function ( buffer ) {
                loaded++;

                var texData = scope._parser( buffer );

                texData.type = type;

                if ( ! texData ) return;

                if(type === THREE.FloatType) {
                    var floatdata = new Float32Array(texData.data.length);
                    for( var j=0; j<floatdata.length; j+=4)
                    {
                        var r = texData.data[j]/255;
                        var g = texData.data[j+1]/255;
                        var b = texData.data[j+2]/255;
                        var e = texData.data[j+3]/255;
                        var d = Math.pow(2.0, e*256.0 - 128.0);
                        floatdata[j]   = r * d;
                        floatdata[j+1] = g * d;
                        floatdata[j+2] = b * d;
                        floatdata[j+3] = 1.0;
                    }
                    texData.data = floatdata;
                }
                if(type === THREE.HalfFloatType) {
                    var floatdata = new Uint16Array(texData.data.length);
                    for( var j=0; j<floatdata.length; j+=4)
                    {
                        var r = texData.data[j]/255;
                        var g = texData.data[j+1]/255;
                        var b = texData.data[j+2]/255;
                        var e = texData.data[j+3]/255;
                        var d = Math.pow(2.0, e*256.0 - 128.0);
                        floatdata[j]   = toHalf(r * d);
                        floatdata[j+1] = toHalf(g * d);
                        floatdata[j+2] = toHalf(b * d);
                        floatdata[j+3] = toHalf(1.0);
                    }
                    texData.data = floatdata;
                }

                if ( undefined !== texData.image ) {
                        texture[i].images = texData.image;
                }
                else if ( undefined !== texData.data ) {
                        var dataTexture = new THREE.DataTexture(texData.data, texData.width, texData.height);
                        dataTexture.format = texData.format;
                        dataTexture.type = texData.type;
                        dataTexture.minFilter = THREE.LinearFilter;
                        dataTexture.magFilter = THREE.LinearFilter;
                        dataTexture.generateMipmaps = false;
                        texture.images[i] = dataTexture;
                }

                if(loaded === 6) {
                        texture.needsUpdate = true;

                        if ( undefined !== texData.format ) {

                                texture.format = texData.format;

                        }
                        if ( undefined !== texData.type ) {

                                texture.type = texData.type;

                        }
                        texture.minFilter = THREE.LinearFilter;
                        texture.magFilter = THREE.LinearFilter;
                        texture.generateMipmaps = false;
                        if ( onLoad ) onLoad( texture );
                }
        }, onProgress, onError );
    }

    for(var i=0; i<urls.length; i++) {
        loadHDRData(i, onLoad, onProgress, onError);
    }
    return texture;
};
