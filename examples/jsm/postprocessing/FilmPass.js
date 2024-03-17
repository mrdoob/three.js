import {
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { FilmShader } from '../shaders/FilmShader.js';

class FilmPass extends Pass {

	constructor( intensity = 0.5, grayscale = false ) {

		super();

		const shader = FilmShader;

		this.uniforms = UniformsUtils.clone( shader.uniforms );

		this.material = new ShaderMaterial( {

			name: shader.name,
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

		this.uniforms.intensity.value = intensity; // (0 = no effect, 1 = full effect)
		this.uniforms.grayscale.value = grayscale;

		this.fsQuad = new FullScreenQuad( this.material );

	}

	render( renderer, writeBuffer, readBuffer, deltaTime /*, maskActive */ ) {

		this.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
		this.uniforms[ 'time' ].value += deltaTime;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();
			this.fsQuad.render( renderer );

		}

	}

	dispose() {

		this.material.dispose();

		this.fsQuad.dispose();

	}

}

export { FilmPass };
