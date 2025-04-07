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

/**
 * This pass can be used to render a cube texture over the entire screen.
 *
 * ```js
 * const cubeMap = new THREE.CubeTextureLoader().load( urls );
 *
 * const cubeTexturePass = new CubeTexturePass( camera, cubemap );
 * composer.addPass( cubeTexturePass );
 * ```
 *
 * @augments Pass
 * @three_import import { CubeTexturePass } from 'three/addons/postprocessing/CubeTexturePass.js';
 */
class CubeTexturePass extends Pass {

	/**
	 * Constructs a new cube texture pass.
	 *
	 * @param {PerspectiveCamera} camera - The camera.
	 * @param {CubeTexture} tCube - The cube texture to render.
	 * @param {number} [opacity=1] - The opacity.
	 */
	constructor( camera, tCube, opacity = 1 ) {

		super();

		/**
		 * The camera.
		 *
		 * @type {PerspectiveCamera}
		 */
		this.camera = camera;

		/**
		 * The cube texture to render.
		 *
		 * @type {CubeTexture}
		 */
		this.tCube = tCube;

		/**
		 * The opacity.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.opacity = opacity;

		/**
		 * Overwritten to disable the swap.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.needsSwap = false;

		// internals

		const cubeShader = ShaderLib[ 'cube' ];

		this._cubeMesh = new Mesh(
			new BoxGeometry( 10, 10, 10 ),
			new ShaderMaterial( {
				uniforms: UniformsUtils.clone( cubeShader.uniforms ),
				vertexShader: cubeShader.vertexShader,
				fragmentShader: cubeShader.fragmentShader,
				depthTest: false,
				depthWrite: false,
				side: BackSide
			} )
		);

		Object.defineProperty( this._cubeMesh.material, 'envMap', {

			get: function () {

				return this.uniforms.tCube.value;

			}

		} );

		this._cubeScene = new Scene();
		this._cubeCamera = new PerspectiveCamera();
		this._cubeScene.add( this._cubeMesh );

	}

	/**
	 * Performs the cube texture pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */
	render( renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/ ) {

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this._cubeCamera.projectionMatrix.copy( this.camera.projectionMatrix );
		this._cubeCamera.quaternion.setFromRotationMatrix( this.camera.matrixWorld );

		this._cubeMesh.material.uniforms.tCube.value = this.tCube;
		this._cubeMesh.material.uniforms.tFlip.value = ( this.tCube.isCubeTexture && this.tCube.isRenderTargetTexture === false ) ? - 1 : 1;
		this._cubeMesh.material.uniforms.opacity.value = this.opacity;
		this._cubeMesh.material.transparent = ( this.opacity < 1.0 );

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this._cubeScene, this._cubeCamera );

		renderer.autoClear = oldAutoClear;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		this._cubeMesh.geometry.dispose();
		this._cubeMesh.material.dispose();

	}

}

export { CubeTexturePass };
