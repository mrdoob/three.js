import { RenderTarget, Vector2, QuadMesh, NodeMaterial, RendererUtils, TempNode, NodeUpdateType } from 'three/webgpu';
import { nodeObject, Fn, float, vec4, uv, texture, passTexture, uniform, sign, max, convertToTexture } from 'three/tsl';

/** @module AfterImageNode **/

const _size = /*@__PURE__*/ new Vector2();
const _quadMeshComp = /*@__PURE__*/ new QuadMesh();

let _rendererState;

/**
 * Post processing node for creating an after image effect.
 *
 * @augments TempNode
 */
class AfterImageNode extends TempNode {

	static get type() {

		return 'AfterImageNode';

	}

	/**
	 * Constructs a new after image node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 * @param {Number} [damp=0.96] - The damping intensity. A higher value means a stronger after image effect.
	 */
	constructor( textureNode, damp = 0.96 ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * The texture represents the pervious frame.
		 *
		 * @type {TextureNode}
		 */
		this.textureNodeOld = texture();

		/**
		 * The damping intensity as a uniform node.
		 *
		 * @type {UniformNode<float>}
		 */
		this.damp = uniform( damp );

		/**
		 * The render target used for compositing the effect.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._compRT = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._compRT.texture.name = 'AfterImageNode.comp';

		/**
		 * The render target that represents the previous frame.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._oldRT = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._oldRT.texture.name = 'AfterImageNode.old';

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._compRT.texture );

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {String}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	/**
	 * Returns the result of the effect as a texture node.
	 *
	 * @return {PassTextureNode} A texture node that represents the result of the effect.
	 */
	getTextureNode() {

		return this._textureNode;

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {Number} width - The width of the effect.
	 * @param {Number} height - The height of the effect.
	 */
	setSize( width, height ) {

		this._compRT.setSize( width, height );
		this._oldRT.setSize( width, height );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		//

		const textureNode = this.textureNode;
		const map = textureNode.value;

		const textureType = map.type;

		this._compRT.texture.type = textureType;
		this._oldRT.texture.type = textureType;

		renderer.getDrawingBufferSize( _size );

		this.setSize( _size.x, _size.y );

		const currentTexture = textureNode.value;

		this.textureNodeOld.value = this._oldRT.texture;

		// comp

		renderer.setRenderTarget( this._compRT );
		_quadMeshComp.render( renderer );

		// Swap the textures

		const temp = this._oldRT;
		this._oldRT = this._compRT;
		this._compRT = temp;

		//

		textureNode.value = currentTexture;

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const textureNode = this.textureNode;
		const textureNodeOld = this.textureNodeOld;

		//

		const uvNode = textureNode.uvNode || uv();

		textureNodeOld.uvNode = uvNode;

		const sampleTexture = ( uv ) => textureNode.sample( uv );

		const when_gt = Fn( ( [ x_immutable, y_immutable ] ) => {

			const y = float( y_immutable ).toVar();
			const x = vec4( x_immutable ).toVar();

			return max( sign( x.sub( y ) ), 0.0 );

		} );

		const afterImg = Fn( () => {

			const texelOld = vec4( textureNodeOld );
			const texelNew = vec4( sampleTexture( uvNode ) );

			texelOld.mulAssign( this.damp.mul( when_gt( texelOld, 0.1 ) ) );
			return max( texelNew, texelOld );

		} );

		//

		const materialComposed = this._materialComposed || ( this._materialComposed = new NodeMaterial() );
		materialComposed.name = 'AfterImage';
		materialComposed.fragmentNode = afterImg();

		_quadMeshComp.material = materialComposed;

		//

		const properties = builder.getNodeProperties( this );
		properties.textureNode = textureNode;

		//

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._compRT.dispose();
		this._oldRT.dispose();

	}

}

/**
 * TSL function for creating an after image node for post processing.
 *
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {Number} [damp=0.96] - The damping intensity. A higher value means a stronger after image effect.
 * @returns {AfterImageNode}
 */
export const afterImage = ( node, damp ) => nodeObject( new AfterImageNode( convertToTexture( node ), damp ) );

export default AfterImageNode;
