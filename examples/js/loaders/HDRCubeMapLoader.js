/**
 * @author Prashant Sharma / spidersharma03
 */

THREE.HDRCubeMapLoader = function (manager) {
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
    // override in sub classes
    this.hdrLoader = new THREE.RGBELoader();
}

THREE.HDRCubeMapLoader.prototype.load = function(urls, onLoad, onProgress, onError) {
    var texture = new THREE.CubeTexture( [] );
    texture.encoding = THREE.RGBE;
    var scope = this.hdrLoader;

    var loaded = 0;

     function loadHDRData(i, onLoad, onProgress, onError) {
        var loader = new THREE.XHRLoader( this.manager );
        loader.setResponseType( 'arraybuffer' );

        loader.load( urls[i], function ( buffer ) {
                loaded++;

                var texData = scope._parser( buffer );

                if ( ! texData ) return;

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
