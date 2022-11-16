import {
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { CopyShader } from '../shaders/CopyShader.js';

class TexturePass extends Pass {

	constructor( map, opacity ) {

		super();

		if ( CopyShader === undefined ) console.error( 'THREE.TexturePass relies on CopyShader' );

		const shader = CopyShader;

		this.map = map;
		this.opacity = ( opacity !== undefined ) ? opacity : 1.0;

		this.uniforms = UniformsUtils.clone( shader.uniforms );

		this.material = new ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			depthTest: false,
			depthWrite: false

		} );

		this.needsSwap = false;

		this.fsQuad = new FullScreenQuad( null );

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.fsQuad.material = this.material;

		this.uniforms[ 'opacity' ].value = this.opacity;
		this.uniforms[ 'tDiffuse' ].value = this.map;
		this.material.transparent = ( this.opacity < 1.0 );

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		if ( this.clear ) renderer.clear();
		this.fsQuad.render( renderer );

		renderer.autoClear = oldAutoClear;

	}

	dispose() {

		this.material.dispose();

		this.fsQuad.dispose();

	}

}

export { TexturePass };
