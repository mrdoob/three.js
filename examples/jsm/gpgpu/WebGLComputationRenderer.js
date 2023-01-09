import { Camera, Mesh, PlaneGeometry, Scene, WebGLRenderTarget } from 'three';
import { int, viewportCoordinate, add, mul, MeshBasicNodeMaterial, ShaderNode, color } from 'three/nodes';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import WebGLTypedBuffer from './WebGLTypedBuffer.js';

export default class WebGLComputationRenderer {

	constructor( shaderNode ) {

		this.shaderNode = shaderNode;

		this._material = new MeshBasicNodeMaterial();
		this._scene = new Scene().add( new Mesh( new PlaneGeometry( 2, 2 ), this._material ) );
		this._camera = new Camera();

	}

	createBuffer( ...params ) {

		return new WebGLTypedBuffer( ...params );

	}

	setBuffers( srcBuffer, outBuffer ) {

		this.srcBuffer = srcBuffer;
		this.outBuffer = outBuffer;

		const outGPUBuffer = outBuffer.buffer;
		outGPUBuffer.isRenderTargetTexture = true;

		this._renderTarget = new WebGLRenderTarget( outGPUBuffer.image.width, outGPUBuffer.image.height, { depthBuffer: false } );
		this._renderTarget.texture = outGPUBuffer;

		const index = add( mul( int( viewportCoordinate.y ), outGPUBuffer.image.width ), int( viewportCoordinate.x ) );
		const shaderParams = { index, element: srcBuffer.getBufferElement( index ), buffer: srcBuffer }; // Same arguments as in Array.forEach()
		this._material.colorNode = new ShaderNode( ( inputs, builder ) => {

			return outBuffer.setBufferElement( index, this.shaderNode.call( shaderParams, builder ) );

		} );
		this._material.needsUpdate = true;

	}

	async compute( renderer, populateTypedArray = true ) {

		nodeFrame.update();

		const currentRenderTarget = renderer.getRenderTarget();
		const renderTarget = this._renderTarget;
		renderer.setRenderTarget( renderTarget );
		renderer.render( this._scene, this._camera );
		if ( populateTypedArray ) {

			renderer.readRenderTargetPixels( renderTarget, 0, 0, renderTarget.width, renderTarget.height, this.outBuffer.typedArray );
							// The .render call populates the GPU buffer, the .readRenderTargetPixels call populates the typed array

		} else {

			this.outBuffer.typedArray = new this.outBuffer.typedArray.constructor( this.outBuffer.typedArray.length );

		}
		renderer.setRenderTarget( currentRenderTarget );

	}

}