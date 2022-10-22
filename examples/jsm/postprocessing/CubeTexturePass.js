import {
	BackSide,
	BoxGeometry,
	Mesh,
	PerspectiveCamera,
	Scene,
	ShaderLib,
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass } from './Pass.js';

class CubeTexturePass extends Pass {

	constructor( camera, envMap, opacity = 1 ) {

		super();

		this.camera = camera;

		this.needsSwap = false;

		this.cubeShader = ShaderLib[ 'cube' ];
		this.cubeMesh = new Mesh(
			new BoxGeometry( 10, 10, 10 ),
			new ShaderMaterial( {
				uniforms: UniformsUtils.clone( this.cubeShader.uniforms ),
				vertexShader: this.cubeShader.vertexShader,
				fragmentShader: this.cubeShader.fragmentShader,
				depthTest: false,
				depthWrite: false,
				side: BackSide
			} )
		);

		Object.defineProperty( this.cubeMesh.material, 'envMap', {

			get: function () {

				return this.uniforms.envMap.value;

			}

		} );

		this.envMap = envMap;
		this.opacity = opacity;

		this.cubeScene = new Scene();
		this.cubeCamera = new PerspectiveCamera();
		this.cubeScene.add( this.cubeMesh );

	}

	render( renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/ ) {

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.cubeCamera.projectionMatrix.copy( this.camera.projectionMatrix );
		this.cubeCamera.quaternion.setFromRotationMatrix( this.camera.matrixWorld );

		this.cubeMesh.material.uniforms.envMap.value = this.envMap;
		this.cubeMesh.material.uniforms.flipEnvMap.value = ( this.envMap.isCubeTexture && this.envMap.isRenderTargetTexture === false ) ? - 1 : 1;
		this.cubeMesh.material.uniforms.opacity.value = this.opacity;
		this.cubeMesh.material.transparent = ( this.opacity < 1.0 );

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

export { CubeTexturePass };
