import { WebGLCubeRenderTarget } from 'three';

// @TODO: Consider rename WebGLCubeRenderTarget to just CubeRenderTarget

class CubeRenderTarget extends WebGLCubeRenderTarget {

	constructor( size = 1, options = {} ) {

		super( size, options );

		this.isCubeRenderTarget = true;

	}

	fromEquirectangularTexture( /*renderer, texture*/ ) {

		console.warn( 'THREE.CubeRenderTarget.fromEquirectangularTexture(): Not implemented yet.' );

	}

}

export default CubeRenderTarget;
