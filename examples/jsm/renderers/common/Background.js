import DataMap from './DataMap.js';
import { Color, Mesh, BoxGeometry, BackSide } from 'three';
import { context, positionWorldDirection, MeshBasicNodeMaterial } from '../../nodes/Nodes.js';

let _clearAlpha;
const _clearColor = new Color();

class Background extends DataMap {

	constructor( renderer, nodes ) {

		super();

		this.renderer = renderer;
		this.nodes = nodes;

		this.boxMesh = null;
		this.boxMeshNode = null;

	}

	update( scene, renderList, renderContext ) {

		const renderer = this.renderer;
		const background = ( scene.isScene === true ) ? this.nodes.getBackgroundNode( scene ) || scene.background : null;

		let forceClear = false;

		if ( background === null ) {

			// no background settings, use clear color configuration from the renderer

			_clearColor.copy( renderer._clearColor );
			_clearAlpha = renderer._clearAlpha;

		} else if ( background.isColor === true ) {

			// background is an opaque color

			_clearColor.copy( background );
			_clearAlpha = 1;
			forceClear = true;

		} else if ( background.isNode === true ) {

			const sceneData = this.get( scene );
			const backgroundNode = background;

			_clearColor.copy( renderer._clearColor );
			_clearAlpha = renderer._clearAlpha;

			let boxMesh = this.boxMesh;

			if ( boxMesh === null ) {

				this.boxMeshNode = context( backgroundNode, {
					// @TODO: Add Texture2D support using node context
					getUVNode: () => positionWorldDirection
				} );

				const nodeMaterial = new MeshBasicNodeMaterial();
				nodeMaterial.colorNode = this.boxMeshNode;
				nodeMaterial.side = BackSide;
				nodeMaterial.depthTest = false;
				nodeMaterial.depthWrite = false;
				nodeMaterial.fog = false;

				this.boxMesh = boxMesh = new Mesh( new BoxGeometry( 1, 1, 1 ), nodeMaterial );
				boxMesh.frustumCulled = false;

				boxMesh.onBeforeRender = function ( renderer, scene, camera ) {

					const scale = camera.far;

					this.matrixWorld.makeScale( scale, scale, scale ).copyPosition( camera.matrixWorld );

				};

			}

			const backgroundCacheKey = backgroundNode.getCacheKey();

			if ( sceneData.backgroundCacheKey !== backgroundCacheKey ) {

				this.boxMeshNode.node = backgroundNode;

				boxMesh.material.needsUpdate = true;

				sceneData.backgroundCacheKey = backgroundCacheKey;

			}

			renderList.unshift( boxMesh, boxMesh.geometry, boxMesh.material, 0, 0, null );

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
