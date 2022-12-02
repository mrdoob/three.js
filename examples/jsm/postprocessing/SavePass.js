import {
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { CopyShader } from '../shaders/CopyShader.js';

class SavePass extends Pass {

	constructor( renderTarget ) {

		super();

		const shader = CopyShader;

		this.textureID = 'tDiffuse';

		this.uniforms = UniformsUtils.clone( shader.uniforms );

		this.material = new ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

		this.renderTarget = renderTarget;

		if ( this.renderTarget === undefined ) {

			this.renderTarget = new WebGLRenderTarget(); // will be resized later
			this.renderTarget.texture.name = 'SavePass.rt';

		}

		this.needsSwap = false;

		this.fsQuad = new FullScreenQuad( this.material );

	}

	render( renderer, writeBuffer, readBuffer/*, deltaTime, maskActive */ ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		renderer.setRenderTarget( this.renderTarget );
		if ( this.clear ) renderer.clear();
		this.fsQuad.render( renderer );

	}

	setSize( width, height ) {

		this.renderTarget.setSize( width, height );

	}

	dispose() {

		this.renderTarget.dispose();

		this.material.dispose();

		this.fsQuad.dispose();

	}

}

export { SavePass };
