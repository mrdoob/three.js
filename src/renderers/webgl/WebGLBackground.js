/**
 * @author mrdoob / http://mrdoob.com/
 */

import { BackSide, FrontSide } from '../../constants.js';
import { BoxBufferGeometry } from '../../geometries/BoxGeometry.js';
import { PlaneBufferGeometry } from '../../geometries/PlaneGeometry.js';
import { ShaderMaterial } from '../../materials/ShaderMaterial.js';
import { Color } from '../../math/Color.js';
import { Mesh } from '../../objects/Mesh.js';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { cloneUniforms } from '../shaders/UniformsUtils.js';

function WebGLBackground( renderer, state, objects, premultipliedAlpha ) {

	var clearColor = new Color( 0x000000 );
	var clearAlpha = 0;

	var planeMesh;
	var boxMesh;
	// Store the current background texture and its `version`
	// so we can recompile the material accordingly.
	var currentBackground = null;
	var currentBackgroundVersion = 0;

	function render( renderList, scene, camera, forceClear ) {

		var background = scene.background;

		var session = renderer.vr.getSession();
		if ( session && session.environmentBlendMode === 'additive' ) background = null;

		if ( background === null ) {

			setClear( clearColor, clearAlpha );
			currentBackground = null;
			currentBackgroundVersion = 0;

		} else if ( background && background.isColor ) {

			setClear( background, 1 );
			forceClear = true;
			currentBackground = null;
			currentBackgroundVersion = 0;

		}

		if ( renderer.autoClear || forceClear ) {

			renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );

		}

		if ( background && ( background.isCubeTexture || background.isWebGLRenderTargetCube ) ) {

			if ( boxMesh === undefined ) {

				boxMesh = new Mesh(
					new BoxBufferGeometry( 1, 1, 1 ),
					new ShaderMaterial( {
						type: 'BackgroundCubeMaterial',
						uniforms: cloneUniforms( ShaderLib.cube.uniforms ),
						vertexShader: ShaderLib.cube.vertexShader,
						fragmentShader: ShaderLib.cube.fragmentShader,
						side: BackSide,
						depthTest: false,
						depthWrite: false,
						fog: false
					} )
				);

				boxMesh.geometry.removeAttribute( 'normal' );
				boxMesh.geometry.removeAttribute( 'uv' );

				boxMesh.onBeforeRender = function ( renderer, scene, camera ) {

					this.matrixWorld.copyPosition( camera.matrixWorld );

				};

				// enable code injection for non-built-in material
				Object.defineProperty( boxMesh.material, 'map', {

					get: function () {

						return this.uniforms.tCube.value;

					}

				} );

				objects.update( boxMesh );

			}

			var texture = background.isWebGLRenderTargetCube ? background.texture : background;
			boxMesh.material.uniforms.tCube.value = texture;
			boxMesh.material.uniforms.tFlip.value = ( background.isWebGLRenderTargetCube ) ? 1 : - 1;

			if ( currentBackground !== background ||
			     currentBackgroundVersion !== texture.version ) {

				boxMesh.material.needsUpdate = true;

				currentBackground = background;
				currentBackgroundVersion = texture.version;

			}

			// push to the pre-sorted opaque render list
			renderList.unshift( boxMesh, boxMesh.geometry, boxMesh.material, 0, 0, null );

		} else if ( background && background.isTexture ) {

			if ( planeMesh === undefined ) {

				planeMesh = new Mesh(
					new PlaneBufferGeometry( 2, 2 ),
					new ShaderMaterial( {
						type: 'BackgroundMaterial',
						uniforms: cloneUniforms( ShaderLib.background.uniforms ),
						vertexShader: ShaderLib.background.vertexShader,
						fragmentShader: ShaderLib.background.fragmentShader,
						side: FrontSide,
						depthTest: false,
						depthWrite: false,
						fog: false
					} )
				);

				planeMesh.geometry.removeAttribute( 'normal' );

				// enable code injection for non-built-in material
				Object.defineProperty( planeMesh.material, 'map', {

					get: function () {

						return this.uniforms.t2D.value;

					}

				} );

				objects.update( planeMesh );

			}

			planeMesh.material.uniforms.t2D.value = background;

			if ( background.matrixAutoUpdate === true ) {

				background.updateMatrix();

			}

			planeMesh.material.uniforms.uvTransform.value.copy( background.matrix );

			if ( currentBackground !== background ||
				   currentBackgroundVersion !== background.version ) {

				planeMesh.material.needsUpdate = true;

				currentBackground = background;
				currentBackgroundVersion = background.version;

			}


			// push to the pre-sorted opaque render list
			renderList.unshift( planeMesh, planeMesh.geometry, planeMesh.material, 0, 0, null );

		}

	}

	function setClear( color, alpha ) {

		state.buffers.color.setClear( color.r, color.g, color.b, alpha, premultipliedAlpha );

	}

	return {

		getClearColor: function () {

			return clearColor;

		},
		setClearColor: function ( color, alpha ) {

			clearColor.set( color );
			clearAlpha = alpha !== undefined ? alpha : 1;
			setClear( clearColor, clearAlpha );

		},
		getClearAlpha: function () {

			return clearAlpha;

		},
		setClearAlpha: function ( alpha ) {

			clearAlpha = alpha;
			setClear( clearColor, clearAlpha );

		},
		render: render

	};

}


export { WebGLBackground };
