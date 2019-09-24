import { WebGLShadowMap } from "../renderers/webgl/WebGLShadowMap.js";

Object.defineProperties( WebGLShadowMap.prototype, {

	cullFace: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function ( /* cullFace */ ) {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead.' );

		}
	},
	renderReverseSided: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead.' );

		}
	},
	renderSingleSided: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function () {

			console.warn( 'THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead.' );

		}
	}

} );
