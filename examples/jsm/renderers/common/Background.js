import DataMap from './DataMap.js';
import { Color, Mesh, SphereGeometry, BackSide } from 'three';
import { vec4, context, normalWorld, backgroundBlurriness, backgroundIntensity, NodeMaterial, modelViewProjection } from '../../nodes/Nodes.js';

let _clearAlpha;
const _clearColor = new Color();

class Background extends DataMap {

	constructor( renderer, nodes ) {

		super();

		this.renderer = renderer;
		this.nodes = nodes;

		this.backgroundMesh = null;
		this.backgroundMeshNode = null;

	}

	update( scene, renderList, renderContext ) {

		const renderer = this.renderer;
		const background = this.nodes.getBackgroundNode( scene ) || scene.background;

		let forceClear = false;

		if ( background === null ) {

			// no background settings, use clear color configuration from the renderer

			_clearColor.copyLinearToSRGB( renderer._clearColor );
			_clearAlpha = renderer._clearAlpha;

		} else if ( background.isColor === true ) {

			// background is an opaque color

			_clearColor.copyLinearToSRGB( background );
			_clearAlpha = 1;
			forceClear = true;

		} else if ( background.isNode === true ) {

			const sceneData = this.get( scene );
			const backgroundNode = background;

			_clearColor.copy( renderer._clearColor );
			_clearAlpha = renderer._clearAlpha;

			let backgroundMesh = this.backgroundMesh;

			if ( backgroundMesh === null ) {

				this.backgroundMeshNode = context( backgroundNode, {
					// @TODO: Add Texture2D support using node context
					getUVNode: () => normalWorld,
					getSamplerLevelNode: () => backgroundBlurriness
				} ).mul( backgroundIntensity );

				let viewProj = modelViewProjection();
				viewProj = vec4( viewProj.x, viewProj.y, viewProj.w, viewProj.w );

				const nodeMaterial = new NodeMaterial();
				nodeMaterial.outputNode = this.backgroundMeshNode;
				nodeMaterial.side = BackSide;
				nodeMaterial.depthTest = false;
				nodeMaterial.depthWrite = false;
				nodeMaterial.fog = false;
				nodeMaterial.vertexNode = viewProj;

				this.backgroundMesh = backgroundMesh = new Mesh( new SphereGeometry( 1, 32, 32 ), nodeMaterial );
				backgroundMesh.frustumCulled = false;

				backgroundMesh.onBeforeRender = function ( renderer, scene, camera ) {

					this.matrixWorld.copyPosition( camera.matrixWorld );

				};

			}

			const backgroundCacheKey = backgroundNode.getCacheKey();

			if ( sceneData.backgroundCacheKey !== backgroundCacheKey ) {

				this.backgroundMeshNode.node = backgroundNode;

				backgroundMesh.material.needsUpdate = true;

				sceneData.backgroundCacheKey = backgroundCacheKey;

			}

			renderList.unshift( backgroundMesh, backgroundMesh.geometry, backgroundMesh.material, 0, 0, null );

		} else {

			console.error( 'THREE.Renderer: Unsupported background configuration.', background );

		}

		//

		if ( renderer.autoClear === true || forceClear === true ) {

			_clearColor.multiplyScalar( _clearAlpha );

			const clearColorValue = renderContext.clearColorValue;

			clearColorValue.r = _clearColor.r;
			clearColorValue.g = _clearColor.g;
			clearColorValue.b = _clearColor.b;
			clearColorValue.a = _clearAlpha;

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
