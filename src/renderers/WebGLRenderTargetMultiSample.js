/**
 * @author Matt DesLauriers / @mattdesl
 */

THREE.WebGLRenderTargetMultisample = function ( width, height, options ) {

  THREE.WebGLRenderTarget.call( this, width, height, options );

  this.samples = 4;
};

THREE.WebGLRenderTargetMultisample.prototype = Object.create( THREE.WebGLRenderTarget.prototype );
THREE.WebGLRenderTargetMultisample.prototype.constructor = THREE.WebGLRenderTargetMultisample;
