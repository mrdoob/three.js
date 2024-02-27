import { addNodeClass } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import TextureNode from '../accessors/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { uniform } from '../core/UniformNode.js';
import { viewZToOrthographicDepth, perspectiveDepthToViewZ } from './ViewportDepthNode.js';
import { RenderTarget, Vector2, HalfFloatType, DepthTexture, NoToneMapping/*, FloatType*/ } from 'three';

class PassTextureNode extends TextureNode {

	constructor( passNode, texture ) {

		super( texture );

		this.passNode = passNode;

		this.setUpdateMatrix( false );

	}

	setup( builder ) {

		this.passNode.build( builder );

		return super.setup( builder );

	}

	clone() {

		return new this.constructor( this.passNode, this.value );

	}

}

class PassNode extends TempNode {

	constructor( scope, scene, camera ) {

		super( 'vec4' );

		this.scope = scope;
		this.scene = scene;
		this.camera = camera;

		this._pixelRatio = 1;
		this._width = 1;
		this._height = 1;

		const depthTexture = new DepthTexture();
		depthTexture.isRenderTargetTexture = true;
		//depthTexture.type = FloatType;
		depthTexture.name = 'PostProcessingDepth';

		const renderTarget = new RenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, { type: HalfFloatType } );
		renderTarget.texture.name = 'PostProcessing';
		renderTarget.depthTexture = depthTexture;

		this.renderTarget = renderTarget;

		this.updateBeforeType = NodeUpdateType.FRAME;

		this._textureNode = nodeObject( new PassTextureNode( this, renderTarget.texture ) );
		this._depthTextureNode = nodeObject( new PassTextureNode( this, depthTexture ) );

		this._depthNode = null;
		this._cameraNear = uniform( 0 );
		this._cameraFar = uniform( 0 );

		this.isPassNode = true;

	}

	isGlobal() {

		return true;

	}

	getTextureNode() {

		return this._textureNode;

	}

	getTextureDepthNode() {

		return this._depthTextureNode;

	}

	getDepthNode() {

		if ( this._depthNode === null ) {

			const cameraNear = this._cameraNear;
			const cameraFar = this._cameraFar;

			this._depthNode = viewZToOrthographicDepth( perspectiveDepthToViewZ( this._depthTextureNode, cameraNear, cameraFar ), cameraNear, cameraFar );

		}

		return this._depthNode;

	}

	setup() {

		return this.scope === PassNode.COLOR ? this.getTextureNode() : this.getDepthNode();

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, camera } = this;

		this._pixelRatio = renderer.getPixelRatio();

		const size = renderer.getSize( new Vector2() );

		this.setSize( size.width, size.height );

		const currentToneMapping = renderer.toneMapping;
		const currentToneMappingNode = renderer.toneMappingNode;
		const currentRenderTarget = renderer.getRenderTarget();

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;

		renderer.toneMapping = NoToneMapping;
		renderer.toneMappingNode = null;
		renderer.setRenderTarget( this.renderTarget );

		renderer.render( scene, camera );

		renderer.toneMapping = currentToneMapping;
		renderer.toneMappingNode = currentToneMappingNode;
		renderer.setRenderTarget( currentRenderTarget );

	}

	setSize( width, height ) {

		this._width = width;
		this._height = height;

		const effectiveWidth = this._width * this._pixelRatio;
		const effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget.setSize( effectiveWidth, effectiveHeight );

	}

	setPixelRatio( pixelRatio ) {

		this._pixelRatio = pixelRatio;

		this.setSize( this._width, this._height );

	}

	dispose() {

		this.renderTarget.dispose();

	}


}

PassNode.COLOR = 'color';
PassNode.DEPTH = 'depth';

export default PassNode;

export const pass = ( scene, camera ) => nodeObject( new PassNode( PassNode.COLOR, scene, camera ) );
export const texturePass = ( pass, texture ) => nodeObject( new PassTextureNode( pass, texture ) );
export const depthPass = ( scene, camera ) => nodeObject( new PassNode( PassNode.DEPTH, scene, camera ) );

addNodeClass( 'PassNode', PassNode );
