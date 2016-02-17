/**
 * @author Matt DesLauriers / @mattdesl
 */

THREE.WebGLMultisampleRenderTarget = function ( width, height, options ) {

  THREE.WebGLRenderTarget.call( this, width, height, options );

  this.samples = 4;
};

THREE.WebGLMultisampleRenderTarget.prototype = Object.create( THREE.WebGLRenderTarget.prototype );
THREE.WebGLMultisampleRenderTarget.prototype.constructor = THREE.WebGLMultisampleRenderTarget;

THREE.WebGLMultisampleRenderTarget.copy = function ( source ) {

  THREE.WebGLRenderTarget.prototype.copy.call( this, source );
  this.samples = source.samples;
  return this;

};
