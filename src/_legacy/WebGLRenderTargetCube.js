import { WebGLRenderTargetCube } from "../renderers/WebGLRenderTargetCube.js";

Object.defineProperties( WebGLRenderTargetCube.prototype, {

	activeCubeFace: {
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebGLRenderTargetCube: .activeCubeFace has been removed. It is now the second parameter of WebGLRenderer.setRenderTarget().' );

		}
	},
	activeMipMapLevel: {
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebGLRenderTargetCube: .activeMipMapLevel has been removed. It is now the third parameter of WebGLRenderer.setRenderTarget().' );

		}
	}

} );
