/**
 * @author mattdesl
 */

THREE.Texture3D = function ( data, width, height, depth, format, type, mapping, wrapS, wrapT, wrapR, magFilter, minFilter, anisotropy ) {

  THREE.Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

  this.image = { data: data, width: width, height: height, depth: depth };

  this.magFilter = magFilter !== undefined ? magFilter : THREE.NearestFilter;
  this.minFilter = minFilter !== undefined ? minFilter : THREE.NearestFilter;
  
  this.flipY = false;
  this.generateMipmaps  = false;
  this.texture.wrapR = wrapR !== undefined ? wrapR : THREE.ClampToEdgeWrapping;
};

THREE.Texture3D.prototype = Object.create( THREE.Texture.prototype );
THREE.Texture3D.prototype.constructor = THREE.Texture3D;

THREE.Texture3D.prototype.copy = function ( source ) {
  THREE.Texture.prototype.copy.call(this, source);
  this.texture.wrapR = source.texture.wrapR;
  return this;
};
