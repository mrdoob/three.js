( function () {

	class CubeTexturePass extends THREE.Pass {

		constructor( camera, tCube, opacity = 1 ) {

			super();
			this.camera = camera;
			this.needsSwap = false;
			this.cubeShader = THREE.ShaderLib[ 'cube' ];
			this.cubeMesh = new THREE.Mesh( new THREE.BoxGeometry( 10, 10, 10 ), new THREE.ShaderMaterial( {
				uniforms: THREE.UniformsUtils.clone( this.cubeShader.uniforms ),
				vertexShader: this.cubeShader.vertexShader,
				fragmentShader: this.cubeShader.fragmentShader,
				depthTest: false,
				depthWrite: false,
				side: THREE.BackSide
			} ) );
			Object.defineProperty( this.cubeMesh.material, 'envMap', {
				get: function () {

					return this.uniforms.tCube.value;

				}
			} );
			this.tCube = tCube;
			this.opacity = opacity;
			this.cubeScene = new THREE.Scene();
			this.cubeCamera = new THREE.PerspectiveCamera();
			this.cubeScene.add( this.cubeMesh );

		}
		render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive*/ ) {

			const oldAutoClear = renderer.autoClear;
			renderer.autoClear = false;
			this.cubeCamera.projectionMatrix.copy( this.camera.projectionMatrix );
			this.cubeCamera.quaternion.setFromRotationMatrix( this.camera.matrixWorld );
			this.cubeMesh.material.uniforms.tCube.value = this.tCube;
			this.cubeMesh.material.uniforms.tFlip.value = this.tCube.isCubeTexture && this.tCube.isRenderTargetTexture === false ? - 1 : 1;
			this.cubeMesh.material.uniforms.opacity.value = this.opacity;
			this.cubeMesh.material.transparent = this.opacity < 1.0;
			renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
			if ( this.clear ) renderer.clear();
			renderer.render( this.cubeScene, this.cubeCamera );
			renderer.autoClear = oldAutoClear;

		}
		dispose() {

			this.cubeMesh.geometry.dispose();
			this.cubeMesh.material.dispose();

		}

	}

	THREE.CubeTexturePass = CubeTexturePass;

} )();
