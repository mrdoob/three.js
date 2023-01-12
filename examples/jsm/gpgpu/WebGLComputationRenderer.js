import { Camera, Mesh, PlaneGeometry, Scene } from 'three';
import { int, viewportCoordinate, MeshBasicNodeMaterial, ShaderNode } from 'three/nodes';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import ComputationRenderer from './ComputationRenderer.js';

export default class WebGLComputationRenderer extends ComputationRenderer {

	constructor( renderer ) {

		super( renderer );

		this._material = new MeshBasicNodeMaterial();
		this._scene = new Scene().add( new Mesh( new PlaneGeometry( 2, 2 ), this._material ) );
		this._camera = new Camera();

	}

	async compute( shaderNode, outBuffer, populateTypedArray = true ) {

		nodeFrame.update();

		const index = int( viewportCoordinate.y ).mul( outBuffer.texture.image.width ).add( int( viewportCoordinate.x ) );
		this._material.colorNode = new ShaderNode( ( inputs, stack ) => shaderNode.call( { index }, stack ) );
		this._material.needsUpdate = true;

		const renderTarget = outBuffer.renderTarget;
		const currentRenderTarget = this.renderer.getRenderTarget();
		this.renderer.setRenderTarget( renderTarget );
		this.renderer.render( this._scene, this._camera );
		if ( populateTypedArray ) {

			this.renderer.readRenderTargetPixels( renderTarget, 0, 0, renderTarget.width, renderTarget.height, outBuffer.attribute.array );
							// The .render call populates the GPU buffer, the .readRenderTargetPixels call populates the typed array

		} else {

			outBuffer.attribute.array = new outBuffer.attribute.array.constructor( outBuffer.attribute.array.length );

		}
		this.renderer.setRenderTarget( currentRenderTarget );

		// outBuffer.attribute.array.needsUpdate = true;

	}

}
