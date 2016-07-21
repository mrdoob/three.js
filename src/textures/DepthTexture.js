/**
 * @author Matt DesLauriers / @mattdesl
 * @author atix / arthursilber.de
 */

THREE.DepthTexture = function ( width, height, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, format ) {

  format = format !== undefined ? format : THREE.DepthFormat;

  if ( format !== THREE.DepthFormat && format !== THREE.DepthStencilFormat ) {

    throw new Error( 'DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat' )

  }

  THREE.Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

  this.image = { width: width, height: height };

  this.type = type !== undefined ? type : THREE.UnsignedShortType;

  this.magFilter = magFilter !== undefined ? magFilter : THREE.NearestFilter;
  this.minFilter = minFilter !== undefined ? minFilter : THREE.NearestFilter;

  this.flipY = false;
  this.generateMipmaps  = false;

};

THREE.DepthTexture.prototype = Object.create( THREE.Texture.prototype );
THREE.DepthTexture.prototype.constructor = THREE.DepthTexture;
