/**
 * @author Matt DesLauriers / @mattdesl
 */

THREE.DepthTexture = function ( width, height, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy ) {

  THREE.Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, THREE.DepthFormat, type, anisotropy );

  this.image = { width: width, height: height };

  this.type = type !== undefined ? type : THREE.UnsignedShortType;

  this.magFilter = magFilter !== undefined ? magFilter : THREE.NearestFilter;
  this.minFilter = minFilter !== undefined ? minFilter : THREE.NearestFilter;

  this.flipY = false;
  this.generateMipmaps  = false;

};

THREE.DepthTexture.prototype = Object.create( THREE.Texture.prototype );
THREE.DepthTexture.prototype.constructor = THREE.DepthTexture;
