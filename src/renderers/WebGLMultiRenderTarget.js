/**
 * @author Matt DesLauriers / @mattdesl
 */

THREE.WebGLMultiRenderTarget = function ( width, height, options ) {

  THREE.WebGLRenderTarget.call( this, width, height, options );

  this.attachments = [ this.texture ];
};

THREE.WebGLMultiRenderTarget.prototype = Object.create( THREE.WebGLRenderTarget.prototype );
THREE.WebGLMultiRenderTarget.prototype.constructor = THREE.WebGLMultiRenderTarget;

THREE.WebGLMultiRenderTarget.copy = function ( source ) {

  THREE.WebGLRenderTarget.prototype.copy.call( this, source );

  this.attachments = source.attachments.map(function ( attachment ) {
    return attachment.clone();
  });

  return this;

};
