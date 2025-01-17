import DataMap from './DataMap.js';
import Color4 from './Color4.js';
import { vec4, context, normalWorld, backgroundBlurriness, backgroundIntensity, backgroundRotation, modelViewProjection } from '../../nodes/TSL.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';

import { Mesh } from '../../objects/Mesh.js';
import { SphereGeometry } from '../../geometries/SphereGeometry.js';
import { BackSide, LinearSRGBColorSpace } from '../../constants.js';

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

			renderer._clearColor.getRGB( _clearColor, LinearSRGBColorSpace );
			_clearColor.a = renderer._clearColor.a;

		} else if ( background.isColor === true ) {

			// background is an opaque color

			background.getRGB( _clearColor, LinearSRGBColorSpace );
			_clearColor.a = 1;

			forceClear = true;

		} else if ( background.isNode === true ) {

			const sceneData = this.get( scene );
			const backgroundNode = background;

			_clearColor.copy( renderer._clearColor );

			let backgroundMesh = sceneData.backgroundMesh;

			if ( backgroundMesh === undefined ) {

				const backgroundMeshNode = context( vec4( backgroundNode ).mul( backgroundIntensity ), {
					// @TODO: Add Texture2D support using node context
					getUV: () => backgroundRotation.mul( normalWorld ),
					getTextureLevel: () => backgroundBlurriness
				} );

				let viewProj = modelViewProjection;
				viewProj = viewProj.setZ( viewProj.w );

				const nodeMaterial = new NodeMaterial();
				nodeMaterial.name = 'Background.material';
				nodeMaterial.side = BackSide;
				nodeMaterial.depthTest = false;
				nodeMaterial.depthWrite = false;
				nodeMaterial.fog = false;
				nodeMaterial.lights = false;
				nodeMaterial.vertexNode = viewProj;
				nodeMaterial.colorNode = backgroundMeshNode;

				sceneData.backgroundMeshNode = backgroundMeshNode;
				sceneData.backgroundMesh = backgroundMesh = new Mesh( new SphereGeometry( 1, 32, 32 ), nodeMaterial );
				backgroundMesh.frustumCulled = false;
				backgroundMesh.name = 'Background.mesh';

				backgroundMesh.onBeforeRender = function ( renderer, scene, camera ) {

					this.matrixWorld.copyPosition( camera.matrixWorld );

				};

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

			console.error( 'THREE.Renderer: Unsupported background configuration.', background );

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
