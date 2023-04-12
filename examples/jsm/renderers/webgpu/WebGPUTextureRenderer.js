import WebGPURenderTarget from './WebGPURenderTarget.js';

class WebGPUTextureRenderer {

	constructor( renderer, options = {} ) {

		this.renderer = renderer;

		this.renderTarget = new WebGPURenderTarget( 1, 1, options );

	}

	getTexture() {

		return this.renderTarget.texture;

	}

	setSize( width, height ) {

		this.renderTarget.setSize( width, height );

	}

	render( scene, camera ) {

		const renderer = this.renderer;
		const renderTarget = this.renderTarget;

		renderer.setRenderTarget( renderTarget );
		renderer.render( scene, camera );
		renderer.setRenderTarget( null );

	}

}

export default WebGPUTextureRenderer;
