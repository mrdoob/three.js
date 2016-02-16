/**
 * @author Matt DesLauriers / @mattdesl
 */

THREE.WebGLRenderTargetMultisample = function ( width, height, options ) {

  THREE.WebGLRenderTarget.call( this, width, height, options );

  this.samples = 4;
};

THREE.WebGLRenderTargetMultisample.prototype = Object.create( THREE.WebGLRenderTarget.prototype );
THREE.WebGLRenderTargetMultisample.prototype.constructor = THREE.WebGLRenderTargetMultisample;

THREE.WebGLRenderTargetMultisample.copy = function ( source ) {

  THREE.WebGLRenderTarget.prototype.copy.call( this, source );
  this.samples = source.samples;
  return this;

};
