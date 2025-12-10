import DataMap from './DataMap.js';
import Color4 from './Color4.js';
import { vec4, normalWorldGeometry, backgroundBlurriness, backgroundIntensity, backgroundRotation, positionLocal, cameraProjectionMatrix, modelViewMatrix, div } from '../../nodes/TSL.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';

import { Mesh } from '../../objects/Mesh.js';
import { SphereGeometry } from '../../geometries/SphereGeometry.js';
import { BackSide } from '../../constants.js';
import { error } from '../../utils.js';

const _clearColor = /*@__PURE__*/ new Color4();

/**
 * This renderer module manages the background.
 *
 * @private
 * @augments DataMap
 */
class Background extends DataMap {

	/**
	 * Constructs a new background management component.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Nodes} nodes - Renderer component for managing nodes related logic.
	 */
	constructor( renderer, nodes ) {

		super();

		/**
		 * The renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * Renderer component for managing nodes related logic.
		 *
		 * @type {Nodes}
		 */
		this.nodes = nodes;

	}

	/**
	 * Updates the background for the given scene. Depending on how `Scene.background`
	 * or `Scene.backgroundNode` are configured, this method might configure a simple clear
	 * or add a mesh to the render list for rendering the background as a textured plane
	 * or skybox.
	 *
	 * @param {Scene} scene - The scene.
	 * @param {RenderList} renderList - The current render list.
	 * @param {RenderContext} renderContext - The current render context.
	 */
	update( scene, renderList, renderContext ) {

		const renderer = this.renderer;
		const background = this.nodes.getBackgroundNode( scene ) || scene.background;

		let forceClear = false;

		if ( background === null ) {

			// no background settings, use clear color configuration from the renderer

			renderer._clearColor.getRGB( _clearColor );
			_clearColor.a = renderer._clearColor.a;

		} else if ( background.isColor === true ) {

			// background is an opaque color

			background.getRGB( _clearColor );
			_clearColor.a = 1;

			forceClear = true;

		} else if ( background.isNode === true ) {

			const sceneData = this.get( scene );
			const backgroundNode = background;

			_clearColor.copy( renderer._clearColor );

			let backgroundMesh = sceneData.backgroundMesh;

			if ( backgroundMesh === undefined ) {

				const backgroundMeshNode = vec4( backgroundNode ).mul( backgroundIntensity ).context( {
					// @TODO: Add Texture2D support using node context
					getUV: () => backgroundRotation.mul( normalWorldGeometry ),
					getTextureLevel: () => backgroundBlurriness
				} );

				// when using orthographic cameras, we must scale the skybox sphere
				// up to exceed the dimensions of the camera's viewing box.
				const isOrtho = cameraProjectionMatrix.element( 3 ).element( 3 ).equal( 1.0 );

				// calculate the orthographic scale
				// projectionMatrix[1][1] is (1 / top). Invert it to get the height and multiply by 3.0
				// (an arbitrary safety factor) to ensure the skybox is large enough to cover the corners
				// of the rectangular screen
				const orthoScale = div( 1.0, cameraProjectionMatrix.element( 1 ).element( 1 ) ).mul( 3.0 );

				// compute vertex position
				const modifiedPosition = isOrtho.select( positionLocal.mul( orthoScale ), positionLocal );

				// By using a w component of 0, the skybox will not translate when the camera moves through the scene
				let viewProj = cameraProjectionMatrix.mul( modelViewMatrix.mul( vec4( modifiedPosition, 0.0 ) ) );

				// force background to far plane so it does not occlude objects
				viewProj = viewProj.setZ( viewProj.w );

				const nodeMaterial = new NodeMaterial();
				nodeMaterial.name = 'Background.material';
				nodeMaterial.side = BackSide;
				nodeMaterial.depthTest = false;
				nodeMaterial.depthWrite = false;
				nodeMaterial.allowOverride = false;
				nodeMaterial.fog = false;
				nodeMaterial.lights = false;
				nodeMaterial.vertexNode = viewProj;
				nodeMaterial.colorNode = backgroundMeshNode;

				sceneData.backgroundMeshNode = backgroundMeshNode;
				sceneData.backgroundMesh = backgroundMesh = new Mesh( new SphereGeometry( 1, 32, 32 ), nodeMaterial );
				backgroundMesh.frustumCulled = false;
				backgroundMesh.name = 'Background.mesh';

				function onBackgroundDispose() {

					background.removeEventListener( 'dispose', onBackgroundDispose );

					backgroundMesh.material.dispose();
					backgroundMesh.geometry.dispose();

				}

				background.addEventListener( 'dispose', onBackgroundDispose );

			}

			const backgroundCacheKey = backgroundNode.getCacheKey();

			if ( sceneData.backgroundCacheKey !== backgroundCacheKey ) {

				sceneData.backgroundMeshNode.node = vec4( backgroundNode ).mul( backgroundIntensity );
				sceneData.backgroundMeshNode.needsUpdate = true;

				backgroundMesh.material.needsUpdate = true;

				sceneData.backgroundCacheKey = backgroundCacheKey;

			}

			renderList.unshift( backgroundMesh, backgroundMesh.geometry, backgroundMesh.material, 0, 0, null, null );

		} else {

			error( 'Renderer: Unsupported background configuration.', background );

		}

		//

		const environmentBlendMode = renderer.xr.getEnvironmentBlendMode();

		if ( environmentBlendMode === 'additive' ) {

			_clearColor.set( 0, 0, 0, 1 );

		} else if ( environmentBlendMode === 'alpha-blend' ) {

			_clearColor.set( 0, 0, 0, 0 );

		}

		//

		if ( renderer.autoClear === true || forceClear === true ) {

			const clearColorValue = renderContext.clearColorValue;

			clearColorValue.r = _clearColor.r;
			clearColorValue.g = _clearColor.g;
			clearColorValue.b = _clearColor.b;
			clearColorValue.a = _clearColor.a;

			// premultiply alpha

			if ( renderer.backend.isWebGLBackend === true || renderer.alpha === true ) {

				clearColorValue.r *= clearColorValue.a;
				clearColorValue.g *= clearColorValue.a;
				clearColorValue.b *= clearColorValue.a;

			}

			//

			renderContext.depthClearValue = renderer._clearDepth;
			renderContext.stencilClearValue = renderer._clearStencil;

			renderContext.clearColor = renderer.autoClearColor === true;
			renderContext.clearDepth = renderer.autoClearDepth === true;
			renderContext.clearStencil = renderer.autoClearStencil === true;

		} else {

			renderContext.clearColor = false;
			renderContext.clearDepth = false;
			renderContext.clearStencil = false;

		}

	}

}

export default Background;
