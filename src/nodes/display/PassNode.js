import { addNodeClass } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { default as TextureNode/*, texture*/ } from '../accessors/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { uniform } from '../core/UniformNode.js';
import { viewZToOrthographicDepth, perspectiveDepthToViewZ } from './ViewportDepthNode.js';

import { HalfFloatType/*, FloatType*/ } from '../../constants.js';
import { Vector2 } from '../../math/Vector2.js';
import { DepthTexture } from '../../textures/DepthTexture.js';
import { RenderTarget } from '../../core/RenderTarget.js';

const _size = new Vector2();

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

	constructor( scope, scene, camera, options = {} ) {

		super( 'vec4' );

		this.scope = scope;
		this.scene = scene;
		this.camera = camera;
		this.options = options;

		this._pixelRatio = 1;
		this._width = 1;
		this._height = 1;

		const depthTexture = new DepthTexture();
		depthTexture.isRenderTargetTexture = true;
		//depthTexture.type = FloatType;
		depthTexture.name = 'PostProcessingDepth';

		const renderTarget = new RenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, { type: HalfFloatType, ...options } );
		renderTarget.texture.name = 'PostProcessing';
		renderTarget.depthTexture = depthTexture;

		this.renderTarget = renderTarget;

		this.updateBeforeType = NodeUpdateType.FRAME;

		this._textureNode = nodeObject( new PassTextureNode( this, renderTarget.texture ) );
		this._depthTextureNode = nodeObject( new PassTextureNode( this, depthTexture ) );

		this._linearDepthNode = null;
		this._viewZNode = null;
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

	getViewZNode() {

		if ( this._viewZNode === null ) {

			const cameraNear = this._cameraNear;
			const cameraFar = this._cameraFar;

			this._viewZNode = perspectiveDepthToViewZ( this._depthTextureNode, cameraNear, cameraFar );

		}

		return this._viewZNode;

	}

	getLinearDepthNode() {

		if ( this._linearDepthNode === null ) {

			const cameraNear = this._cameraNear;
			const cameraFar = this._cameraFar;

			// TODO: just if ( builder.camera.isPerspectiveCamera )

			this._linearDepthNode = viewZToOrthographicDepth( this.getViewZNode(), cameraNear, cameraFar );

		}

		return this._linearDepthNode;

	}

	setup( { renderer } ) {

		this.renderTarget.samples = this.options.samples === undefined ? renderer.samples : this.options.samples;

		// Disable MSAA for WebGL backend for now
		if ( renderer.backend.isWebGLBackend === true ) {

			this.renderTarget.samples = 0;

		}

		this.renderTarget.depthTexture.isMultisampleRenderTargetTexture = this.renderTarget.samples > 1;

		return this.scope === PassNode.COLOR ? this.getTextureNode() : this.getLinearDepthNode();

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, camera } = this;

		this._pixelRatio = renderer.getPixelRatio();

		const size = renderer.getSize( _size );

		this.setSize( size.width, size.height );

		const currentRenderTarget = renderer.getRenderTarget();

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;

		renderer.setRenderTarget( this.renderTarget );

		renderer.render( scene, camera );

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

export const pass = ( scene, camera, options ) => nodeObject( new PassNode( PassNode.COLOR, scene, camera, options ) );
export const texturePass = ( pass, texture ) => nodeObject( new PassTextureNode( pass, texture ) );
export const depthPass = ( scene, camera ) => nodeObject( new PassNode( PassNode.DEPTH, scene, camera ) );

addNodeClass( 'PassNode', PassNode );
