( function () {

	class SavePass extends THREE.Pass {

		constructor( renderTarget ) {

			super();
			if ( THREE.CopyShader === undefined ) console.error( 'THREE.SavePass relies on THREE.CopyShader' );
			const shader = THREE.CopyShader;
			this.textureID = 'tDiffuse';
			this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
			this.material = new THREE.ShaderMaterial( {
				uniforms: this.uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader
			} );
			this.renderTarget = renderTarget;
			if ( this.renderTarget === undefined ) {

				this.renderTarget = new THREE.WebGLRenderTarget(); // will be resized later
				this.renderTarget.texture.name = 'SavePass.rt';

			}

			this.needsSwap = false;
			this.fsQuad = new THREE.FullScreenQuad( this.material );

		}
		render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

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

	THREE.SavePass = SavePass;

} )();
