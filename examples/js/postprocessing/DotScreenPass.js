( function () {

	class DotScreenPass extends THREE.Pass {

		constructor( center, angle, scale ) {

			super();
			if ( THREE.DotScreenShader === undefined ) console.error( 'THREE.DotScreenPass relies on THREE.DotScreenShader' );
			var shader = THREE.DotScreenShader;
			this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
			if ( center !== undefined ) this.uniforms[ 'center' ].value.copy( center );
			if ( angle !== undefined ) this.uniforms[ 'angle' ].value = angle;
			if ( scale !== undefined ) this.uniforms[ 'scale' ].value = scale;
			this.material = new THREE.ShaderMaterial( {
				uniforms: this.uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader
			} );
			this.fsQuad = new THREE.FullScreenQuad( this.material );

		}

		render( renderer, writeBuffer, readBuffer
			/*, deltaTime, maskActive */
		) {

			this.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
			this.uniforms[ 'tSize' ].value.set( readBuffer.width, readBuffer.height );

			if ( this.renderToScreen ) {

				renderer.setRenderTarget( null );
				this.fsQuad.render( renderer );

			} else {

				renderer.setRenderTarget( writeBuffer );
				if ( this.clear ) renderer.clear();
				this.fsQuad.render( renderer );

			}

		}

	}

	THREE.DotScreenPass = DotScreenPass;

} )();
