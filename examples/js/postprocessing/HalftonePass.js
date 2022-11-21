( function () {

	/**
 * RGB Halftone pass for three.js effects composer. Requires THREE.HalftoneShader.
 */

	class HalftonePass extends THREE.Pass {

		constructor( width, height, params ) {

			super();
			if ( THREE.HalftoneShader === undefined ) {

				console.error( 'THREE.HalftonePass requires THREE.HalftoneShader' );

			}

			this.uniforms = THREE.UniformsUtils.clone( THREE.HalftoneShader.uniforms );
			this.material = new THREE.ShaderMaterial( {
				uniforms: this.uniforms,
				fragmentShader: THREE.HalftoneShader.fragmentShader,
				vertexShader: THREE.HalftoneShader.vertexShader
			} );

			// set params
			this.uniforms.width.value = width;
			this.uniforms.height.value = height;
			for ( const key in params ) {

				if ( params.hasOwnProperty( key ) && this.uniforms.hasOwnProperty( key ) ) {

					this.uniforms[ key ].value = params[ key ];

				}

			}

			this.fsQuad = new THREE.FullScreenQuad( this.material );

		}
		render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive*/ ) {

			this.material.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
			if ( this.renderToScreen ) {

				renderer.setRenderTarget( null );
				this.fsQuad.render( renderer );

			} else {

				renderer.setRenderTarget( writeBuffer );
				if ( this.clear ) renderer.clear();
				this.fsQuad.render( renderer );

			}

		}
		setSize( width, height ) {

			this.uniforms.width.value = width;
			this.uniforms.height.value = height;

		}
		dispose() {

			this.material.dispose();
			this.fsQuad.dispose();

		}

	}

	THREE.HalftonePass = HalftonePass;

} )();
