/**
 * @author Daosheng Mu / https://github.com/DaoshengMu/
 */

THREE.TGATexture = function ( format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy ) {
    
    THREE.Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );
};

THREE.TGATexture.prototype = Object.create( THREE.Texture.prototype );

THREE.TGATexture.prototype.clone = function() {
    
    var texture = new THREE.TGATexture();
    
    THREE.Texture.prototype.clone.all( this. texture );
    
    return texture;
};