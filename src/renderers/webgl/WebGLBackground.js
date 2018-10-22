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
import { UniformsUtils } from '../shaders/UniformsUtils.js';

function WebGLBackground( renderer, state, objects, premultipliedAlpha ) {

	var clearColor = new Color( 0x000000 );
	var clearAlpha = 0;

	var planeMesh;
	var boxMesh;

	function render( renderList, scene, camera, forceClear ) {

		var background = scene.background;

		if ( background === null ) {

			setClear( clearColor, clearAlpha );

		} else if ( background && background.isColor ) {

			setClear( background, 1 );
			forceClear = true;

		}

		if ( renderer.autoClear || forceClear ) {

			renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );

		}

		if ( background && ( background.isCubeTexture || background.isWebGLRenderTargetCube ) ) {

			if ( boxMesh === undefined ) {

				boxMesh = new Mesh(
					new BoxBufferGeometry( 1, 1, 1 ),
					new ShaderMaterial( {
						uniforms: UniformsUtils.clone( ShaderLib.cube.uniforms ),
						vertexShader: ShaderLib.cube.vertexShader,
						fragmentShader: ShaderLib.cube.fragmentShader,
						side: BackSide,
						depthTest: true,
						depthWrite: false,
						fog: false
					} )
				);

				boxMesh.geometry.removeAttribute( 'normal' );
				boxMesh.geometry.removeAttribute( 'uv' );

				boxMesh.onBeforeRender = function ( renderer, scene, camera ) {

					this.matrixWorld.copyPosition( camera.matrixWorld );

				};

				objects.update( boxMesh );

			}

			boxMesh.material.uniforms.tCube.value = ( background.isWebGLRenderTargetCube ) ? background.texture : background;
			boxMesh.material.uniforms.tFlip.value = ( background.isWebGLRenderTargetCube ) ? 1 : - 1;

			// push to the pre-sorted opaque render list
			renderList.push( boxMesh, boxMesh.geometry, boxMesh.material, 0, null );

		} else if ( background && background.isTexture ) {

			if ( planeMesh === undefined ) {

				planeMesh = new Mesh(
					new PlaneBufferGeometry( 2, 2 ),
					new ShaderMaterial( {
						uniforms: UniformsUtils.clone( ShaderLib.background.uniforms ),
						vertexShader: ShaderLib.background.vertexShader,
						fragmentShader: ShaderLib.background.fragmentShader,
						side: FrontSide,
						depthTest: true,
						depthWrite: false,
						fog: false
					} )
				);

				planeMesh.geometry.removeAttribute( 'normal' );

				objects.update( planeMesh );

			}

			planeMesh.material.uniforms.t2D.value = background;

			// push to the pre-sorted opaque render list
			renderList.push( planeMesh, planeMesh.geometry, planeMesh.material, 0, null );

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
