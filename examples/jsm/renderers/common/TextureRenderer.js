import RenderTarget from './RenderTarget.js';

class TextureRenderer {

	constructor( renderer, options = {} ) {

		this.renderer = renderer;

		this.renderTarget = new RenderTarget( 1, 1, options );

	}

	get texture() {

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

export default TextureRenderer;
