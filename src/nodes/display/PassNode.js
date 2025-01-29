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

/** @module PassNode **/

const _size = /*@__PURE__*/ new Vector2();

/**
 * Represents the texture of a pass node.
 *
 * @augments module:TextureNode~TextureNode
 */
class PassTextureNode extends TextureNode {

	static get type() {

		return 'PassTextureNode';

	}

	/**
	 * Constructs a new pass texture node.
	 *
	 * @param {PassNode} passNode - The pass node.
	 * @param {Texture} texture - The output texture.
	 */
	constructor( passNode, texture ) {

		super( texture );

		/**
		 * A reference to the pass node.
		 *
		 * @type {PassNode}
		 */
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

/**
 * An extension of `PassTextureNode` which allows to manage more than one
 * internal texture. Relevant for the `getPreviousTexture()` related API.
 *
 * @augments module:PassTextureNode~PassTextureNode
 */
class PassMultipleTextureNode extends PassTextureNode {

	static get type() {

		return 'PassMultipleTextureNode';

	}

	/**
	 * Constructs a new pass texture node.
	 *
	 * @param {PassNode} passNode - The pass node.
	 * @param {String} textureName - The output texture name.
	 * @param {Boolean} [previousTexture=false] - Whether previous frame data should be used or not.
	 */
	constructor( passNode, textureName, previousTexture = false ) {

		// null is passed to the super call since this class does not
		// use an external texture for rendering pass data into. Instead
		// the texture is managed by the pass node itself

		super( passNode, null );

		/**
		 * The output texture name.
		 *
		 * @type {String}
		 */
		this.textureName = textureName;

		/**
		 * Whether previous frame data should be used or not.
		 *
		 * @type {Boolean}
		 */
		this.previousTexture = previousTexture;

	}

	/**
	 * Updates the texture reference of this node.
	 */
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

/**
 * Represents a render pass (sometimes called beauty pass) in context of post processing.
 * This pass produces a render for the given scene and camera and can provide multiple outputs
 * via MRT for further processing.
 *
 * ```js
 * const postProcessing = new PostProcessing( renderer );
 *
 * const scenePass = pass( scene, camera );
 *
 * postProcessing.outputNode = scenePass;
 * ```
 *
 * @augments TempNode
 */
class PassNode extends TempNode {

	static get type() {

		return 'PassNode';

	}

	/**
	 * Constructs a new pass node.
	 *
	 * @param {('color'|'depth')} scope - The scope of the pass. The scope determines whether the node outputs color or depth.
	 * @param {Scene} scene - A reference to the scene.
	 * @param {Camera} camera - A reference to the camera.
	 * @param {Object} options - Options for the internal render target.
	 */
	constructor( scope, scene, camera, options = {} ) {

		super( 'vec4' );

		/**
		 * The scope of the pass. The scope determines whether the node outputs color or depth.
		 *
		 * @type {('color'|'depth')}
		 */
		this.scope = scope;

		/**
		 * A reference to the scene.
		 *
		 * @type {Scene}
		 */
		this.scene = scene;

		/**
		 * A reference to the camera.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * Options for the internal render target.
		 *
		 * @type {Object}
		 */
		this.options = options;

		/**
		 * The pass's pixel ratio. Will be kept automatically kept in sync with the renderer's pixel ratio.
		 *
		 * @private
		 * @type {Number}
		 * @default 1
		 */
		this._pixelRatio = 1;

		/**
		 * The pass's pixel width. Will be kept automatically kept in sync with the renderer's width.
		 * @private
		 * @type {Number}
		 * @default 1
		 */
		this._width = 1;

		/**
		 * The pass's pixel height. Will be kept automatically kept in sync with the renderer's height.
		 * @private
		 * @type {Number}
		 * @default 1
		 */
		this._height = 1;

		const depthTexture = new DepthTexture();
		depthTexture.isRenderTargetTexture = true;
		//depthTexture.type = FloatType;
		depthTexture.name = 'depth';

		const renderTarget = new RenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, { type: HalfFloatType, ...options, } );
		renderTarget.texture.name = 'output';
		renderTarget.depthTexture = depthTexture;

		/**
		 * The pass's render target.
		 *
		 * @type {RenderTarget}
		 */
		this.renderTarget = renderTarget;

		/**
		 * A dictionary holding the internal result textures.
		 *
		 * @private
		 * @type {Object<String, Texture>}
		 */
		this._textures = {
			output: renderTarget.texture,
			depth: depthTexture
		};

		/**
		 * A dictionary holding the internal texture nodes.
		 *
		 * @private
		 * @type {Object<String, TextureNode>}
		 */
		this._textureNodes = {};

		/**
		 * A dictionary holding the internal depth nodes.
		 *
		 * @private
		 * @type {Object}
		 */
		this._linearDepthNodes = {};

		/**
		 * A dictionary holding the internal viewZ nodes.
		 *
		 * @private
		 * @type {Object}
		 */
		this._viewZNodes = {};

		/**
		 * A dictionary holding the texture data of the previous frame.
		 * Used for computing velocity/motion vectors.
		 *
		 * @private
		 * @type {Object<String, Texture>}
		 */
		this._previousTextures = {};

		/**
		 * A dictionary holding the texture nodes of the previous frame.
		 * Used for computing velocity/motion vectors.
		 *
		 * @private
		 * @type {Object<String, TextureNode>}
		 */
		this._previousTextureNodes = {};

		/**
		 * The `near` property of the camera as a uniform.
		 *
		 * @private
		 * @type {UniformNode}
		 */
		this._cameraNear = uniform( 0 );

		/**
		 * The `far` property of the camera as a uniform.
		 *
		 * @private
		 * @type {UniformNode}
		 */
		this._cameraFar = uniform( 0 );

		/**
		 * A MRT node configuring the MRT settings.
		 *
		 * @private
		 * @type {MRTNode?}
		 * @default null
		 */
		this._mrt = null;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isPassNode = true;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders the
		 * scene once per frame in its {@link PassNode#updateBefore} method.
		 *
		 * @type {String}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	/**
	 * Sets the given MRT node to setup MRT for this pass.
	 *
	 * @param {MRTNode} mrt - The MRT object.
	 * @return {PassNode} A reference to this pass.
	 */
	setMRT( mrt ) {

		this._mrt = mrt;

		return this;

	}

	/**
	 * Returns the current MRT node.
	 *
	 * @return {MRTNode} The current MRT node.
	 */
	getMRT() {

		return this._mrt;

	}

	/**
	 * The method is overwritten so it always returns `true`.
	 *
	 * @return {Boolean} Whether this node is global or not.
	 */
	isGlobal() {

		return true;

	}

	/**
	 * Returns the texture for the given output name.
	 *
	 * @param {String} name - The output name to get the texture for.
	 * @return {Texture} The texture.
	 */
	getTexture( name ) {

		let texture = this._textures[ name ];

		if ( texture === undefined ) {

			const refTexture = this.renderTarget.texture;

			texture = refTexture.clone();
			texture.name = name;

			this._textures[ name ] = texture;

			this.renderTarget.textures.push( texture );

		}

		return texture;

	}

	/**
	 * Returns the texture holding the data of the previous frame for the given output name.
	 *
	 * @param {String} name - The output name to get the texture for.
	 * @return {Texture} The texture holding the data of the previous frame.
	 */
	getPreviousTexture( name ) {

		let texture = this._previousTextures[ name ];

		if ( texture === undefined ) {

			texture = this.getTexture( name ).clone();

			this._previousTextures[ name ] = texture;

		}

		return texture;

	}

	/**
	 * Switches current and previous textures for the given output name.
	 *
	 * @param {String} name - The output name.
	 */
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

	/**
	 * Returns the texture node for the given output name.
	 *
	 * @param {String} [name='output'] - The output name to get the texture node for.
	 * @return {TextureNode} The texture node.
	 */
	getTextureNode( name = 'output' ) {

		let textureNode = this._textureNodes[ name ];

		if ( textureNode === undefined ) {

			textureNode = nodeObject( new PassMultipleTextureNode( this, name ) );
			textureNode.updateTexture();
			this._textureNodes[ name ] = textureNode;

		}

		return textureNode;

	}

	/**
	 * Returns the previous texture node for the given output name.
	 *
	 * @param {String} [name='output'] - The output name to get the previous texture node for.
	 * @return {TextureNode} The previous texture node.
	 */
	getPreviousTextureNode( name = 'output' ) {

		let textureNode = this._previousTextureNodes[ name ];

		if ( textureNode === undefined ) {

			if ( this._textureNodes[ name ] === undefined ) this.getTextureNode( name );

			textureNode = nodeObject( new PassMultipleTextureNode( this, name, true ) );
			textureNode.updateTexture();
			this._previousTextureNodes[ name ] = textureNode;

		}

		return textureNode;

	}

	/**
	 * Returns a viewZ node of this pass.
	 *
	 * @param {String} [name='depth'] - The output name to get the viewZ node for. In most cases the default `'depth'` can be used however the parameter exists for custom depth outputs.
	 * @return {Node} The viewZ node.
	 */
	getViewZNode( name = 'depth' ) {

		let viewZNode = this._viewZNodes[ name ];

		if ( viewZNode === undefined ) {

			const cameraNear = this._cameraNear;
			const cameraFar = this._cameraFar;

			this._viewZNodes[ name ] = viewZNode = perspectiveDepthToViewZ( this.getTextureNode( name ), cameraNear, cameraFar );

		}

		return viewZNode;

	}

	/**
	 * Returns a linear depth node of this pass.
	 *
	 * @param {String} [name='depth'] - The output name to get the linear depth node for. In most cases the default `'depth'` can be used however the parameter exists for custom depth outputs.
	 * @return {Node} The linear depth node.
	 */
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

		// TODO: Disable MSAA for WebGL backend for now
		if ( renderer.backend.isWebGLBackend === true ) {

			this.renderTarget.samples = 0;

		}

		this.renderTarget.texture.type = renderer.getColorBufferType();

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

	/**
	 * Sets the size of the pass's render target. Honors the pixel ratio.
	 *
	 * @param {Number} width - The width to set.
	 * @param {Number} height - The height to set.
	 */
	setSize( width, height ) {

		this._width = width;
		this._height = height;

		const effectiveWidth = this._width * this._pixelRatio;
		const effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget.setSize( effectiveWidth, effectiveHeight );

	}

	/**
	 * Sets the pixel ratio the pass's render target and updates the size.
	 *
	 * @param {Number} pixelRatio - The pixel ratio to set.
	 */
	setPixelRatio( pixelRatio ) {

		this._pixelRatio = pixelRatio;

		this.setSize( this._width, this._height );

	}

	/**
	 * Frees internal resources. Should be called when the node is no longer in use.
	 */
	dispose() {

		this.renderTarget.dispose();

	}


}

PassNode.COLOR = 'color';
PassNode.DEPTH = 'depth';

export default PassNode;

/**
 * TSL function for creating a pass node.
 *
 * @function
 * @param {Scene} scene - A reference to the scene.
 * @param {Camera} camera - A reference to the camera.
 * @param {Object} options - Options for the internal render target.
 * @returns {PassNode}
 */
export const pass = ( scene, camera, options ) => nodeObject( new PassNode( PassNode.COLOR, scene, camera, options ) );

/**
 * TSL function for creating a pass texture node.
 *
 * @function
 * @param {PassNode} pass - The pass node.
 * @param {Texture} texture - The output texture.
 * @returns {PassTextureNode}
 */
export const passTexture = ( pass, texture ) => nodeObject( new PassTextureNode( pass, texture ) );

/**
 * TSL function for creating a depth pass node.
 *
 * @function
 * @param {Scene} scene - A reference to the scene.
 * @param {Camera} camera - A reference to the camera.
 * @param {Object} options - Options for the internal render target.
 * @returns {PassNode}
 */
export const depthPass = ( scene, camera, options ) => nodeObject( new PassNode( PassNode.DEPTH, scene, camera, options ) );
