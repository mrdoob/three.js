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

const _size = /*@__PURE__*/ new Vector2();

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

class PassMultipleTextureNode extends PassTextureNode {

	constructor( passNode, textureName ) {

		super( passNode, null );

		this.textureName = textureName;

	}

	setup( builder ) {

		this.value = this.passNode.getTexture( this.textureName );

		return super.setup( builder );

	}

	clone() {

		return new this.constructor( this.passNode, this.textureName );

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
		depthTexture.name = 'depth';

		const renderTarget = new RenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, { type: HalfFloatType, ...options, } );
		renderTarget.texture.name = 'output';
		renderTarget.depthTexture = depthTexture;

		this.renderTarget = renderTarget;

		this.updateBeforeType = NodeUpdateType.FRAME;

		this._textures = {
			output: renderTarget.texture,
			depth: depthTexture
		};

		this._textureNodes = {};
		this._linearDepthNodes = {};
		this._viewZNodes = {};

		this._cameraNear = uniform( 0 );
		this._cameraFar = uniform( 0 );

		this._mrt = null;

		this.isPassNode = true;

	}

	setMRT( mrt ) {

		this._mrt = mrt;

		return this;

	}

	getMRT() {

		return this._mrt;

	}

	isGlobal() {

		return true;

	}

	getTexture( name ) {

		let texture = this._textures[ name ];

		if ( texture === undefined ) {

			const refTexture = this.renderTarget.texture;

			texture = refTexture.clone();
			texture.isRenderTargetTexture = true;
			texture.name = name;

			this._textures[ name ] = texture;

			this.renderTarget.textures.push( texture );

		}

		return texture;

	}

	getTextureNode( name = 'output' ) {

		let textureNode = this._textureNodes[ name ];

		if ( textureNode === undefined ) {

			this._textureNodes[ name ] = textureNode = nodeObject( new PassMultipleTextureNode( this, name ) );

		}

		return textureNode;

	}

	getViewZNode( name = 'depth' ) {

		let viewZNode = this._viewZNodes[ name ];

		if ( viewZNode === undefined ) {

			const cameraNear = this._cameraNear;
			const cameraFar = this._cameraFar;

			this._viewZNodes[ name ] = viewZNode = perspectiveDepthToViewZ( this.getTextureNode( name ), cameraNear, cameraFar );

		}

		return viewZNode;

	}

	getLinearDepthNode( name = 'depth' ) {

		let linearDepthNode = this._linearDepthNodes[ name ];

		if ( linearDepthNode === undefined ) {

			const cameraNear = this._cameraNear;
			const cameraFar = this._cameraFar;
			const viewZNode = this.getViewZNode( name );

			// TODO: just if ( builder.camera.isPerspectiveCamera )

			this._linearDepthNodes[ name ] = linearDepthNode = viewZToOrthographicDepth( viewZNode, cameraNear, cameraFar );

		}

		return linearDepthNode;

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
		const currentMRT = renderer.getMRT();

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;

		renderer.setRenderTarget( this.renderTarget );
		renderer.setMRT( this._mrt );

		renderer.render( scene, camera );

		renderer.setRenderTarget( currentRenderTarget );
		renderer.setMRT( currentMRT );

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
export const passTexture = ( pass, texture ) => nodeObject( new PassTextureNode( pass, texture ) );
export const depthPass = ( scene, camera ) => nodeObject( new PassNode( PassNode.DEPTH, scene, camera ) );

addNodeClass( 'PassNode', PassNode );
