import { GPULoadOp, GPUStoreOp } from './constants.js';
import { Color, Mesh, BoxGeometry, BackSide } from 'three';
import { context, transformDirection, positionWorld, modelWorldMatrix, MeshBasicNodeMaterial } from 'three/nodes';

let _clearAlpha;
const _clearColor = new Color();

class WebGPUBackground {

	constructor( renderer, properties ) {

		this.renderer = renderer;
		this.properties = properties;

		this.boxMesh = null;
		this.boxMeshNode = null;

		this.forceClear = false;

	}

	clear() {

		this.forceClear = true;

	}

	update( renderList, scene, renderPassDescriptor, renderAttachments ) {

		const renderer = this.renderer;
		const background = ( scene.isScene === true ) ? scene.backgroundNode || this.properties.get( scene ).backgroundNode || scene.background : null;

		let forceClear = this.forceClear;

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

			const sceneProperties = this.properties.get( scene );
			const backgroundNode = background;

			_clearColor.copy( renderer._clearColor );
			_clearAlpha = renderer._clearAlpha;

			let boxMesh = this.boxMesh;

			if ( boxMesh === null ) {

				this.boxMeshNode = context( backgroundNode, {
					// @TODO: Add Texture2D support using node context
					getUVNode: () => transformDirection( positionWorld, modelWorldMatrix )
				} );

				const nodeMaterial = new MeshBasicNodeMaterial();
				nodeMaterial.colorNode = this.boxMeshNode;
				nodeMaterial.side = BackSide;
				nodeMaterial.depthTest = false;
				nodeMaterial.depthWrite = false;
				nodeMaterial.fog = false;

				this.boxMesh = boxMesh = new Mesh( new BoxGeometry( 1, 1, 1 ), nodeMaterial );

				boxMesh.onBeforeRender = function ( renderer, scene, camera ) {

					this.matrixWorld.copyPosition( camera.matrixWorld );

				};

			}

			const backgroundCacheKey = backgroundNode.getCacheKey();

			if ( sceneProperties.backgroundMeshCacheKey !== backgroundCacheKey ) {

				this.boxMeshNode.node = backgroundNode;

				boxMesh.material.needsUpdate = true;

				sceneProperties.backgroundMeshCacheKey = backgroundCacheKey;

			}

			renderList.unshift( boxMesh, boxMesh.geometry, boxMesh.material, 0, 0, null );

		} else {

			console.error( 'THREE.WebGPURenderer: Unsupported background configuration.', background );

		}

		// configure render pass descriptor

		const colorAttachment = renderPassDescriptor.colorAttachments[ 0 ];
		const depthStencilAttachment = renderPassDescriptor.depthStencilAttachment;

		if ( renderer.autoClear === true || forceClear === true ) {

			if ( renderer.autoClearColor === true ) {

				_clearColor.multiplyScalar( _clearAlpha );

				colorAttachment.clearValue = { r: _clearColor.r, g: _clearColor.g, b: _clearColor.b, a: _clearAlpha };
				colorAttachment.loadOp = GPULoadOp.Clear;
				colorAttachment.storeOp = GPUStoreOp.Store;

			} else {

				colorAttachment.loadOp = GPULoadOp.Load;
				colorAttachment.storeOp = GPUStoreOp.Store;

			}

			if ( renderAttachments.depth ) {

				if ( renderer.autoClearDepth === true ) {

					depthStencilAttachment.depthClearValue = renderer._clearDepth;
					depthStencilAttachment.depthLoadOp = GPULoadOp.Clear;
					depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;

				} else {

					depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
					depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;

				}

			}

			if ( renderAttachments.stencil ) {

				if ( renderer.autoClearStencil === true ) {

					depthStencilAttachment.stencilClearValue = renderer._clearStencil;
					depthStencilAttachment.stencilLoadOp = GPULoadOp.Clear;
					depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;

				} else {

					depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;
					depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;

				}

			}

		} else {

			colorAttachment.loadOp = GPULoadOp.Load;
			colorAttachment.storeOp = GPUStoreOp.Store;

			if ( renderAttachments.depth ) {

				depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
				depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;

			}

			if ( renderAttachments.stencil ) {

				depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;
				depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;

			}

		}

		this.forceClear = false;

	}

}

export default WebGPUBackground;
