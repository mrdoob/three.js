import {
	DataTexture,
	FloatType,
	MathUtils,
	RedFormat,
	LuminanceFormat,
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { DigitalGlitch } from '../shaders/DigitalGlitch.js';

class GlitchPass extends Pass {

	constructor( dt_size = 64 ) {

		super();

		if ( DigitalGlitch === undefined ) console.error( 'THREE.GlitchPass relies on DigitalGlitch' );

		const shader = DigitalGlitch;

		this.uniforms = UniformsUtils.clone( shader.uniforms );

		this.heightMap = this.generateHeightmap( dt_size );

		this.uniforms[ 'tDisp' ].value = this.heightMap;

		this.material = new ShaderMaterial( {
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader
		} );

		this.fsQuad = new FullScreenQuad( this.material );

		this.goWild = false;
		this.curF = 0;
		this.generateTrigger();

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		if ( renderer.capabilities.isWebGL2 === false ) this.uniforms[ 'tDisp' ].value.format = LuminanceFormat;

		this.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
		this.uniforms[ 'seed' ].value = Math.random();//default seeding
		this.uniforms[ 'byp' ].value = 0;

		if ( this.curF % this.randX == 0 || this.goWild == true ) {

			this.uniforms[ 'amount' ].value = Math.random() / 30;
			this.uniforms[ 'angle' ].value = MathUtils.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'seed_x' ].value = MathUtils.randFloat( - 1, 1 );
			this.uniforms[ 'seed_y' ].value = MathUtils.randFloat( - 1, 1 );
			this.uniforms[ 'distortion_x' ].value = MathUtils.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = MathUtils.randFloat( 0, 1 );
			this.curF = 0;
			this.generateTrigger();

		} else if ( this.curF % this.randX < this.randX / 5 ) {

			this.uniforms[ 'amount' ].value = Math.random() / 90;
			this.uniforms[ 'angle' ].value = MathUtils.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'distortion_x' ].value = MathUtils.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = MathUtils.randFloat( 0, 1 );
			this.uniforms[ 'seed_x' ].value = MathUtils.randFloat( - 0.3, 0.3 );
			this.uniforms[ 'seed_y' ].value = MathUtils.randFloat( - 0.3, 0.3 );

		} else if ( this.goWild == false ) {

			this.uniforms[ 'byp' ].value = 1;

		}

		this.curF ++;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();
			this.fsQuad.render( renderer );

		}

	}

	generateTrigger() {

		this.randX = MathUtils.randInt( 120, 240 );

	}

	generateHeightmap( dt_size ) {

		const data_arr = new Float32Array( dt_size * dt_size );
		const length = dt_size * dt_size;

		for ( let i = 0; i < length; i ++ ) {

			const val = MathUtils.randFloat( 0, 1 );
			data_arr[ i ] = val;

		}

		const texture = new DataTexture( data_arr, dt_size, dt_size, RedFormat, FloatType );
		texture.needsUpdate = true;
		return texture;

	}

	dispose() {

		this.material.dispose();

		this.heightMap.dispose();

		this.fsQuad.dispose();

	}

}

export { GlitchPass };
