( function () {

	class GlitchPass extends THREE.Pass {

		constructor( dt_size = 64 ) {

			super();
			if ( THREE.DigitalGlitch === undefined ) console.error( 'THREE.GlitchPass relies on THREE.DigitalGlitch' );
			const shader = THREE.DigitalGlitch;
			this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
			this.uniforms[ 'tDisp' ].value = this.generateHeightmap( dt_size );
			this.material = new THREE.ShaderMaterial( {
				uniforms: this.uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader
			} );
			this.fsQuad = new THREE.FullScreenQuad( this.material );
			this.goWild = false;
			this.curF = 0;
			this.generateTrigger();

		}

		render( renderer, writeBuffer, readBuffer
			/*, deltaTime, maskActive */
		) {

			if ( renderer.capabilities.isWebGL2 === false ) this.uniforms[ 'tDisp' ].value.format = THREE.LuminanceFormat;
			this.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
			this.uniforms[ 'seed' ].value = Math.random(); //default seeding

			this.uniforms[ 'byp' ].value = 0;

			if ( this.curF % this.randX == 0 || this.goWild == true ) {

				this.uniforms[ 'amount' ].value = Math.random() / 30;
				this.uniforms[ 'angle' ].value = THREE.MathUtils.randFloat( - Math.PI, Math.PI );
				this.uniforms[ 'seed_x' ].value = THREE.MathUtils.randFloat( - 1, 1 );
				this.uniforms[ 'seed_y' ].value = THREE.MathUtils.randFloat( - 1, 1 );
				this.uniforms[ 'distortion_x' ].value = THREE.MathUtils.randFloat( 0, 1 );
				this.uniforms[ 'distortion_y' ].value = THREE.MathUtils.randFloat( 0, 1 );
				this.curF = 0;
				this.generateTrigger();

			} else if ( this.curF % this.randX < this.randX / 5 ) {

				this.uniforms[ 'amount' ].value = Math.random() / 90;
				this.uniforms[ 'angle' ].value = THREE.MathUtils.randFloat( - Math.PI, Math.PI );
				this.uniforms[ 'distortion_x' ].value = THREE.MathUtils.randFloat( 0, 1 );
				this.uniforms[ 'distortion_y' ].value = THREE.MathUtils.randFloat( 0, 1 );
				this.uniforms[ 'seed_x' ].value = THREE.MathUtils.randFloat( - 0.3, 0.3 );
				this.uniforms[ 'seed_y' ].value = THREE.MathUtils.randFloat( - 0.3, 0.3 );

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

			this.randX = THREE.MathUtils.randInt( 120, 240 );

		}

		generateHeightmap( dt_size ) {

			const data_arr = new Float32Array( dt_size * dt_size );
			const length = dt_size * dt_size;

			for ( let i = 0; i < length; i ++ ) {

				const val = THREE.MathUtils.randFloat( 0, 1 );
				data_arr[ i ] = val;

			}

			const texture = new THREE.DataTexture( data_arr, dt_size, dt_size, THREE.RedFormat, THREE.FloatType );
			texture.needsUpdate = true;
			return texture;

		}

	}

	THREE.GlitchPass = GlitchPass;

} )();
