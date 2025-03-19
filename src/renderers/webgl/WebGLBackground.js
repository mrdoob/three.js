import { BackSide, FrontSide, CubeUVReflectionMapping, SRGBTransfer } from '../../constants.js';
import { BoxGeometry } from '../../geometries/BoxGeometry.js';
import { PlaneGeometry } from '../../geometries/PlaneGeometry.js';
import { ShaderMaterial } from '../../materials/ShaderMaterial.js';
import { Color } from '../../math/Color.js';
import { ColorManagement } from '../../math/ColorManagement.js';
import { Euler } from '../../math/Euler.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Mesh } from '../../objects/Mesh.js';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { cloneUniforms, getUnlitUniformColorSpace } from '../shaders/UniformsUtils.js';

const _rgb = { r: 0, b: 0, g: 0 };
const _e1 = /*@__PURE__*/ new Euler();
const _m1 = /*@__PURE__*/ new Matrix4();

function WebGLBackground( renderer, cubemaps, cubeuvmaps, state, objects, alpha, premultipliedAlpha ) {

	const clearColor = new Color( 0x000000 );
	let clearAlpha = alpha === true ? 0 : 1;

	let planeMesh;
	let boxMesh;

	let currentBackground = null;
	let currentBackgroundVersion = 0;
	let currentTonemapping = null;

	function getBackground( scene ) {

		let background = scene.isScene === true ? scene.background : null;

		if ( background && background.isTexture ) {

			const usePMREM = scene.backgroundBlurriness > 0; // use PMREM if the user wants to blur the background
			background = ( usePMREM ? cubeuvmaps : cubemaps ).get( background );

		}

		return background;

	}

	function render( scene ) {

		let forceClear = false;
		const background = getBackground( scene );

		if ( background === null ) {

			setClear( clearColor, clearAlpha );

		} else if ( background && background.isColor ) {

			setClear( background, 1 );
			forceClear = true;

		}

		const environmentBlendMode = renderer.xr.getEnvironmentBlendMode();

		if ( environmentBlendMode === 'additive' ) {

			state.buffers.color.setClear( 0, 0, 0, 1, premultipliedAlpha );

		} else if ( environmentBlendMode === 'alpha-blend' ) {

			state.buffers.color.setClear( 0, 0, 0, 0, premultipliedAlpha );

		}

		if ( renderer.autoClear || forceClear ) {

			// buffers might not be writable which is required to ensure a correct clear

			state.buffers.depth.setTest( true );
			state.buffers.depth.setMask( true );
			state.buffers.color.setMask( true );

			renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );

		}

	}

	function addToRenderList( renderList, scene ) {

		const background = getBackground( scene );

		if ( background && ( background.isCubeTexture || background.mapping === CubeUVReflectionMapping ) ) {

			if ( boxMesh === undefined ) {

				boxMesh = new Mesh(
					new BoxGeometry( 1, 1, 1 ),
					new ShaderMaterial( {
						name: 'BackgroundCubeMaterial',
						uniforms: cloneUniforms( ShaderLib.backgroundCube.uniforms ),
						vertexShader: ShaderLib.backgroundCube.vertexShader,
						fragmentShader: ShaderLib.backgroundCube.fragmentShader,
						side: BackSide,
						depthTest: false,
						depthWrite: false,
						fog: false,
						allowOverride: false
					} )
				);

				boxMesh.geometry.deleteAttribute( 'normal' );
				boxMesh.geometry.deleteAttribute( 'uv' );

				boxMesh.onBeforeRender = function ( renderer, scene, camera ) {

					this.matrixWorld.copyPosition( camera.matrixWorld );

				};

				// add "envMap" material property so the renderer can evaluate it like for built-in materials
				Object.defineProperty( boxMesh.material, 'envMap', {

					get: function () {

						return this.uniforms.envMap.value;

					}

				} );

				objects.update( boxMesh );

			}

			_e1.copy( scene.backgroundRotation );

			// accommodate left-handed frame
			_e1.x *= - 1; _e1.y *= - 1; _e1.z *= - 1;

			if ( background.isCubeTexture && background.isRenderTargetTexture === false ) {

				// environment maps which are not cube render targets or PMREMs follow a different convention
				_e1.y *= - 1;
				_e1.z *= - 1;

			}

			boxMesh.material.uniforms.envMap.value = background;
			boxMesh.material.uniforms.flipEnvMap.value = ( background.isCubeTexture && background.isRenderTargetTexture === false ) ? - 1 : 1;
			boxMesh.material.uniforms.backgroundBlurriness.value = scene.backgroundBlurriness;
			boxMesh.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
			boxMesh.material.uniforms.backgroundRotation.value.setFromMatrix4( _m1.makeRotationFromEuler( _e1 ) );
			boxMesh.material.toneMapped = ColorManagement.getTransfer( background.colorSpace ) !== SRGBTransfer;

			if ( currentBackground !== background ||
				currentBackgroundVersion !== background.version ||
				currentTonemapping !== renderer.toneMapping ) {

				boxMesh.material.needsUpdate = true;

				currentBackground = background;
				currentBackgroundVersion = background.version;
				currentTonemapping = renderer.toneMapping;

			}

			boxMesh.layers.enableAll();

			// push to the pre-sorted opaque render list
			renderList.unshift( boxMesh, boxMesh.geometry, boxMesh.material, 0, 0, null );

		} else if ( background && background.isTexture ) {

			if ( planeMesh === undefined ) {

				planeMesh = new Mesh(
					new PlaneGeometry( 2, 2 ),
					new ShaderMaterial( {
						name: 'BackgroundMaterial',
						uniforms: cloneUniforms( ShaderLib.background.uniforms ),
						vertexShader: ShaderLib.background.vertexShader,
						fragmentShader: ShaderLib.background.fragmentShader,
						side: FrontSide,
						depthTest: false,
						depthWrite: false,
						fog: false,
						allowOverride: false
					} )
				);

				planeMesh.geometry.deleteAttribute( 'normal' );

				// add "map" material property so the renderer can evaluate it like for built-in materials
				Object.defineProperty( planeMesh.material, 'map', {

					get: function () {

						return this.uniforms.t2D.value;

					}

				} );

				objects.update( planeMesh );

			}

			planeMesh.material.uniforms.t2D.value = background;
			planeMesh.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
			planeMesh.material.toneMapped = ColorManagement.getTransfer( background.colorSpace ) !== SRGBTransfer;

			if ( background.matrixAutoUpdate === true ) {

				background.updateMatrix();

			}

			planeMesh.material.uniforms.uvTransform.value.copy( background.matrix );

			if ( currentBackground !== background ||
				currentBackgroundVersion !== background.version ||
				currentTonemapping !== renderer.toneMapping ) {

				planeMesh.material.needsUpdate = true;

				currentBackground = background;
				currentBackgroundVersion = background.version;
				currentTonemapping = renderer.toneMapping;

			}

			planeMesh.layers.enableAll();

			// push to the pre-sorted opaque render list
			renderList.unshift( planeMesh, planeMesh.geometry, planeMesh.material, 0, 0, null );

		}

	}

	function setClear( color, alpha ) {

		color.getRGB( _rgb, getUnlitUniformColorSpace( renderer ) );

		state.buffers.color.setClear( _rgb.r, _rgb.g, _rgb.b, alpha, premultipliedAlpha );

	}

	function dispose() {

		if ( boxMesh !== undefined ) {

			boxMesh.geometry.dispose();
			boxMesh.material.dispose();

			boxMesh = undefined;

		}

		if ( planeMesh !== undefined ) {

			planeMesh.geometry.dispose();
			planeMesh.material.dispose();

			planeMesh = undefined;

		}

	}

	return {

		getClearColor: function () {

			return clearColor;

		},
		setClearColor: function ( color, alpha = 1 ) {

			clearColor.set( color );
			clearAlpha = alpha;
			setClear( clearColor, clearAlpha );

		},
		getClearAlpha: function () {

			return clearAlpha;

		},
		setClearAlpha: function ( alpha ) {

			clearAlpha = alpha;
			setClear( clearColor, clearAlpha );

		},
		render: render,
		addToRenderList: addToRenderList,
		dispose: dispose

	};

}


export { WebGLBackground };
