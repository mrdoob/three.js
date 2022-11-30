( function () {

	class AfterimagePass extends THREE.Pass {

		constructor( damp = 0.96 ) {

			super();
			if ( THREE.AfterimageShader === undefined ) console.error( 'THREE.AfterimagePass relies on THREE.AfterimageShader' );
			this.shader = THREE.AfterimageShader;
			this.uniforms = THREE.UniformsUtils.clone( this.shader.uniforms );
			this.uniforms[ 'damp' ].value = damp;
			this.textureComp = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {
				magFilter: THREE.NearestFilter
			} );
			this.textureOld = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {
				magFilter: THREE.NearestFilter
			} );
			this.compFsMaterial = new THREE.ShaderMaterial( {
				uniforms: this.uniforms,
				vertexShader: this.shader.vertexShader,
				fragmentShader: this.shader.fragmentShader
			} );
			this.compFsQuad = new THREE.FullScreenQuad( this.compFsMaterial );
			this.copyFsMaterial = new THREE.MeshBasicMaterial();
			this.copyFsQuad = new THREE.FullScreenQuad( this.copyFsMaterial );

		}
		render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive*/ ) {

			this.uniforms[ 'tOld' ].value = this.textureOld.texture;
			this.uniforms[ 'tNew' ].value = readBuffer.texture;
			renderer.setRenderTarget( this.textureComp );
			this.compFsQuad.render( renderer );
			this.copyFsQuad.material.map = this.textureComp.texture;
			if ( this.renderToScreen ) {

				renderer.setRenderTarget( null );
				this.copyFsQuad.render( renderer );

			} else {

				renderer.setRenderTarget( writeBuffer );
				if ( this.clear ) renderer.clear();
				this.copyFsQuad.render( renderer );

			}

			// Swap buffers.
			const temp = this.textureOld;
			this.textureOld = this.textureComp;
			this.textureComp = temp;
			// Now textureOld contains the latest image, ready for the next frame.

		}

		setSize( width, height ) {

			this.textureComp.setSize( width, height );
			this.textureOld.setSize( width, height );

		}
		dispose() {

			this.textureComp.dispose();
			this.textureOld.dispose();
			this.compFsMaterial.dispose();
			this.copyFsMaterial.dispose();
			this.compFsQuad.dispose();
			this.copyFsQuad.dispose();

		}

	}

	THREE.AfterimagePass = AfterimagePass;

} )();
