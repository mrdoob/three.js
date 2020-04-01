/**
 * @author mrdoob / http://mrdoob.com/
 */

import { BackSide, FrontSide, CubeUVReflectionMapping } from '../../constants.js';
import { BoxBufferGeometry } from '../../geometries/BoxGeometry.js';
import { PlaneBufferGeometry } from '../../geometries/PlaneGeometry.js';
import { ShaderMaterial } from '../../materials/ShaderMaterial.js';
import { Color } from '../../math/Color.js';
import { Mesh } from '../../objects/Mesh.js';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { cloneUniforms } from '../shaders/UniformsUtils.js';

class WebGLBackground {

	constructor( renderer, state, objects, premultipliedAlpha ) {

		this.renderer = renderer;

		this.state = state;

		this.objects = objects;

		this.premultipliedAlpha = premultipliedAlpha;

		this.clearColor = new Color( 0x000000 );
		this.clearAlpha = 0;

		this.planeMesh;
		this.boxMesh;

		this.currentBackground = null;
		this.currentBackgroundVersion = 0;
		this.currentTonemapping = null;

	}

	render( renderList, scene, camera, forceClear ) {

		var background = scene.background;

		// Ignore background in AR
		// TODO: Reconsider this.

		var xr = this.renderer.xr;
		var session = xr.getSession && xr.getSession();

		if ( session && session.environmentBlendMode === 'additive' ) {

			background = null;

		}

		if ( background === null ) {

			this.setClear( this.clearColor, this.clearAlpha );

		} else if ( background && background.isColor ) {

			this.setClear( background, 1 );
			forceClear = true;

		}

		if ( this.renderer.autoClear || forceClear ) {

			this.renderer.clear( this.renderer.autoClearColor, this.renderer.autoClearDepth, this.renderer.autoClearStencil );

		}

		if ( background && ( background.isCubeTexture || background.isWebGLCubeRenderTarget || background.mapping === CubeUVReflectionMapping ) ) {

			if ( this.boxMesh === undefined ) {

				this.boxMesh = new Mesh(
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

				this.boxMesh.geometry.deleteAttribute( 'normal' );
				this.boxMesh.geometry.deleteAttribute( 'uv' );

				this.boxMesh.onBeforeRender = function ( renderer, scene, camera ) {

					this.matrixWorld.copyPosition( camera.matrixWorld );

				};

				// enable code injection for non-built-in material
				Object.defineProperty( this.boxMesh.material, 'envMap', {

					get() {

						return this.uniforms.envMap.value;

					}

				} );

				this.objects.update( this.boxMesh );

			}

			var texture = background.isWebGLCubeRenderTarget ? background.texture : background;

			this.boxMesh.material.uniforms.envMap.value = texture;
			this.boxMesh.material.uniforms.flipEnvMap.value = texture.isCubeTexture ? - 1 : 1;

			if ( this.currentBackground !== background ||
				this.currentBackgroundVersion !== texture.version ||
				this.currentTonemapping !== this.renderer.toneMapping ) {

				this.boxMesh.material.needsUpdate = true;

				this.currentBackground = background;
				this.currentBackgroundVersion = texture.version;
				this.currentTonemapping = this.renderer.toneMapping;

			}

			// push to the pre-sorted opaque render list
			renderList.unshift( this.boxMesh, this.boxMesh.geometry, this.boxMesh.material, 0, 0, null );

		} else if ( background && background.isTexture ) {

			if ( this.planeMesh === undefined ) {

				this.planeMesh = new Mesh(
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

				this.planeMesh.geometry.deleteAttribute( 'normal' );

				// enable code injection for non-built-in material
				Object.defineProperty( this.planeMesh.material, 'map', {

					get() {

						return this.uniforms.t2D.value;

					}

				} );

				this.objects.update( this.planeMesh );

			}

			this.planeMesh.material.uniforms.t2D.value = background;

			if ( background.matrixAutoUpdate === true ) {

				background.updateMatrix();

			}

			this.planeMesh.material.uniforms.uvTransform.value.copy( background.matrix );

			if ( this.currentBackground !== background ||
				this.currentBackgroundVersion !== background.version ||
				this.currentTonemapping !== this.renderer.toneMapping ) {

				this.planeMesh.material.needsUpdate = true;

				this.currentBackground = background;
				this.currentBackgroundVersion = background.version;
				this.currentTonemapping = this.renderer.toneMapping;

			}


			// push to the pre-sorted opaque render list
			renderList.unshift( this.planeMesh, this.planeMesh.geometry, this.planeMesh.material, 0, 0, null );

		}

	}

	setClear( color, alpha ) {

		this.state.buffers.color.setClear( color.r, color.g, color.b, alpha, this.premultipliedAlpha );

	}

	getClearColor() {

		return this.clearColor;

	}

	setClearColor( color, alpha ) {

		this.clearColor.set( color );
		this.clearAlpha = alpha !== undefined ? alpha : 1;
		this.setClear( this.clearColor, this.clearAlpha );

	}

	getClearAlpha() {

		return this.clearAlpha;

	}

	setClearAlpha( alpha ) {

		this.clearAlpha = alpha;
		this.setClear( this.clearColor, this.clearAlpha );

	}

}


export { WebGLBackground };
