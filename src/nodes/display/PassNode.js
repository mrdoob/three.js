import TempNode from '../core/TempNode.js';
import { default as TextureNode/*, texture*/ } from '../accessors/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeObject } from '../tsl/TSLBase.js';
import { uniform } from '../core/UniformNode.js';
import { viewZToOrthographicDepth, perspectiveDepthToViewZ } from './ViewportDepthNode.js';

import { HalfFloatType/*, FloatType*/ } from '../../constants.js';
import { Vector2 } from '../../math/Vector2.js';
import { DepthTexture } from '../../textures/DepthTexture.js';
import { RenderTarget } from '../../core/RenderTarget.js';

const _size = /*@__PURE__*/ new Vector2();

class PassTextureNode extends TextureNode {

	static get type() {

		return 'PassTextureNode';

	}

	constructor( passNode, texture ) {

		super( texture );

		this.passNode = passNode;

		this.setUpdateMatrix( false );

	}

	setup( builder ) {

		if ( builder.object.isQuadMesh ) this.passNode.build( builder );

		return super.setup( builder );

	}

	clone() {

		return new this.constructor( this.passNode, this.value );

	}

}

class PassMultipleTextureNode extends PassTextureNode {

	static get type() {

		return 'PassMultipleTextureNode';

	}

	constructor( passNode, textureName, previousTexture = false ) {

		super( passNode, null );

		this.textureName = textureName;
		this.previousTexture = previousTexture;

	}

	updateTexture() {

		this.value = this.previousTexture ? this.passNode.getPreviousTexture( this.textureName ) : this.passNode.getTexture( this.textureName );

	}

	setup( builder ) {

		this.updateTexture();

		return super.setup( builder );

	}

	clone() {

		return new this.constructor( this.passNode, this.textureName, this.previousTexture );

	}

}

class PassNode extends TempNode {

	static get type() {

		return 'PassNode';

	}

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

		this._previousTextures = {};
		this._previousTextureNodes = {};

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

	getPreviousTexture( name ) {

		let texture = this._previousTextures[ name ];

		if ( texture === undefined ) {

			texture = this.getTexture( name ).clone();
			texture.isRenderTargetTexture = true;

			this._previousTextures[ name ] = texture;

		}

		return texture;

	}

	toggleTexture( name ) {

		const prevTexture = this._previousTextures[ name ];

		if ( prevTexture !== undefined ) {

			const texture = this._textures[ name ];

			const index = this.renderTarget.textures.indexOf( texture );
			this.renderTarget.textures[ index ] = prevTexture;

			this._textures[ name ] = prevTexture;
			this._previousTextures[ name ] = texture;

			this._textureNodes[ name ].updateTexture();
			this._previousTextureNodes[ name ].updateTexture();

		}

	}

	getTextureNode( name = 'output' ) {

		let textureNode = this._textureNodes[ name ];

		if ( textureNode === undefined ) {

			this._textureNodes[ name ] = textureNode = nodeObject( new PassMultipleTextureNode( this, name ) );
			this._textureNodes[ name ].updateTexture();

		}

		return textureNode;

	}

	getPreviousTextureNode( name = 'output' ) {

		let textureNode = this._previousTextureNodes[ name ];

		if ( textureNode === undefined ) {

			if ( this._textureNodes[ name ] === undefined ) this.getTextureNode( name );

			this._previousTextureNodes[ name ] = textureNode = nodeObject( new PassMultipleTextureNode( this, name, true ) );
			this._previousTextureNodes[ name ].updateTexture();

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

		for ( const name in this._previousTextures ) {

			this.toggleTexture( name );

		}

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
