import { Camera, Mesh, PlaneGeometry, Scene, WebGLRenderTarget } from 'three';
import { int, viewportCoordinate, MeshBasicNodeMaterial, ShaderNode } from 'three/nodes';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import ComputationRenderer from './ComputationRenderer.js';
import WebGLTypedBuffer from './WebGLTypedBuffer.js';

export default class WebGLComputationRenderer extends ComputationRenderer {

	constructor( renderer ) {

		super( renderer );

		this._material = new MeshBasicNodeMaterial();
		this._scene = new Scene().add( new Mesh( new PlaneGeometry( 2, 2 ), this._material ) );
		this._camera = new Camera();

	}

	createBuffer( ...params ) {

		const buffer = new WebGLTypedBuffer( ...params );
		this._buffers.push( buffer );
		return buffer;

	}

	async compute( shaderNode, outBuffer, populateTypedArray = true ) {

		nodeFrame.update();

		const outGPUBuffer = outBuffer.buffer;
		outGPUBuffer.isRenderTargetTexture = true;
		const outTypedArray = outBuffer.typedArray;

		const renderTarget = new WebGLRenderTarget( outGPUBuffer.image.width, outGPUBuffer.image.height, { depthBuffer: false } );
		renderTarget.texture = outGPUBuffer;

		const index = int( viewportCoordinate.y ).mul( outGPUBuffer.image.width ).add( int( viewportCoordinate.x ) );
		this._material.colorNode = new ShaderNode( ( inputs, builder ) => {

			return outBuffer.setBufferElement( index, shaderNode.call( { index }, builder ) );

		} );
		this._material.needsUpdate = true;

		const currentRenderTarget = this.renderer.getRenderTarget();
		this.renderer.setRenderTarget( renderTarget );
		this.renderer.render( this._scene, this._camera );
		if ( populateTypedArray ) {

			this.renderer.readRenderTargetPixels( renderTarget, 0, 0, renderTarget.width, renderTarget.height, outTypedArray );
							// The .render call populates the GPU buffer, the .readRenderTargetPixels call populates the typed array

		} else {

			outBuffer.typedArray = outTypedArray.length; // null array

		}
		this.renderer.setRenderTarget( currentRenderTarget );

	}

}