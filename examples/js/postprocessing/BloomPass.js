( function () {

	class BloomPass extends THREE.Pass {

		constructor( strength = 1, kernelSize = 25, sigma = 4, resolution = 256 ) {

			super(); // render targets

			const pars = {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				format: THREE.RGBAFormat
			};
			this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
			this.renderTargetX.texture.name = 'BloomPass.x';
			this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );
			this.renderTargetY.texture.name = 'BloomPass.y'; // copy material

			if ( THREE.CopyShader === undefined ) console.error( 'THREE.BloomPass relies on THREE.CopyShader' );
			const copyShader = THREE.CopyShader;
			this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );
			this.copyUniforms[ 'opacity' ].value = strength;
			this.materialCopy = new THREE.ShaderMaterial( {
				uniforms: this.copyUniforms,
				vertexShader: copyShader.vertexShader,
				fragmentShader: copyShader.fragmentShader,
				blending: THREE.AdditiveBlending,
				transparent: true
			} ); // convolution material

			if ( THREE.ConvolutionShader === undefined ) console.error( 'THREE.BloomPass relies on THREE.ConvolutionShader' );
			const convolutionShader = THREE.ConvolutionShader;
			this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );
			this.convolutionUniforms[ 'uImageIncrement' ].value = BloomPass.blurX;
			this.convolutionUniforms[ 'cKernel' ].value = THREE.ConvolutionShader.buildKernel( sigma );
			this.materialConvolution = new THREE.ShaderMaterial( {
				uniforms: this.convolutionUniforms,
				vertexShader: convolutionShader.vertexShader,
				fragmentShader: convolutionShader.fragmentShader,
				defines: {
					'KERNEL_SIZE_FLOAT': kernelSize.toFixed( 1 ),
					'KERNEL_SIZE_INT': kernelSize.toFixed( 0 )
				}
			} );
			this.needsSwap = false;
			this.fsQuad = new THREE.FullScreenQuad( null );

		}

		render( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {

			if ( maskActive ) renderer.state.buffers.stencil.setTest( false ); // Render quad with blured scene into texture (convolution pass 1)

			this.fsQuad.material = this.materialConvolution;
			this.convolutionUniforms[ 'tDiffuse' ].value = readBuffer.texture;
			this.convolutionUniforms[ 'uImageIncrement' ].value = BloomPass.blurX;
			renderer.setRenderTarget( this.renderTargetX );
			renderer.clear();
			this.fsQuad.render( renderer ); // Render quad with blured scene into texture (convolution pass 2)

			this.convolutionUniforms[ 'tDiffuse' ].value = this.renderTargetX.texture;
			this.convolutionUniforms[ 'uImageIncrement' ].value = BloomPass.blurY;
			renderer.setRenderTarget( this.renderTargetY );
			renderer.clear();
			this.fsQuad.render( renderer ); // Render original scene with superimposed blur to texture

			this.fsQuad.material = this.materialCopy;
			this.copyUniforms[ 'tDiffuse' ].value = this.renderTargetY.texture;
			if ( maskActive ) renderer.state.buffers.stencil.setTest( true );
			renderer.setRenderTarget( readBuffer );
			if ( this.clear ) renderer.clear();
			this.fsQuad.render( renderer );

		}

	}

	BloomPass.blurX = new THREE.Vector2( 0.001953125, 0.0 );
	BloomPass.blurY = new THREE.Vector2( 0.0, 0.001953125 );

	THREE.BloomPass = BloomPass;

} )();
