/**
 * @author mrdoob / http://mrdoob.com/
 */

import { BackSide } from '../../constants.js';
import { OrthographicCamera } from '../../cameras/OrthographicCamera.js';
import { BoxBufferGeometry } from '../../geometries/BoxGeometry.js';
import { PlaneBufferGeometry } from '../../geometries/PlaneGeometry.js';
import { MeshBasicMaterial } from '../../materials/MeshBasicMaterial.js';
import { ShaderMaterial } from '../../materials/ShaderMaterial.js';
import { Color } from '../../math/Color.js';
import { Mesh } from '../../objects/Mesh.js';
import { ShaderLib } from '../shaders/ShaderLib.js';

function WebGLBackground( renderer, state, geometries, premultipliedAlpha ) {

	var clearColor = new Color( 0x000000 );
	var clearAlpha = 0;

	var planeCamera, planeMesh;
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

		if ( background && background.isCubeTexture ) {

			if ( boxMesh === undefined ) {

				boxMesh = new Mesh(
					new BoxBufferGeometry( 1, 1, 1 ),
					new ShaderMaterial( {
						uniforms: ShaderLib.cube.uniforms,
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

				geometries.update( boxMesh.geometry );

			}

			boxMesh.material.uniforms.tCube.value = background;

			renderList.push( boxMesh, boxMesh.geometry, boxMesh.material, 0, null );

		} else if ( background && background.isTexture ) {

			if ( planeCamera === undefined ) {

				planeCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

				planeMesh = new Mesh(
					new PlaneBufferGeometry( 2, 2 ),
					new MeshBasicMaterial( { depthTest: false, depthWrite: false, fog: false } )
				);

				geometries.update( planeMesh.geometry );

			}

			planeMesh.material.map = background;

			// TODO Push this to renderList

			renderer.renderBufferDirect( planeCamera, null, planeMesh.geometry, planeMesh.material, planeMesh, null );

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
