import { RenderTarget, Vector2, QuadMesh, NodeMaterial, RendererUtils, TempNode, NodeUpdateType } from 'three/webgpu';
import { nodeObject, Fn, float, uv, texture, passTexture, sign, max, convertToTexture } from 'three/tsl';

const _size = /*@__PURE__*/ new Vector2();
const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState;

/**
 * Post processing node for creating an after image effect.
 *
 * @augments TempNode
 * @three_import import { afterImage } from 'three/addons/tsl/display/AfterImageNode.js';
 */
class AfterImageNode extends TempNode {

	static get type() {

		return 'AfterImageNode';

	}

	/**
	 * Constructs a new after image node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 * @param {Node<float>} [damp=0.96] - The damping intensity. A higher value means a stronger after image effect.
	 */
	constructor( textureNode, damp = float( 0.96 ) ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * How quickly the after-image fades. A higher value means the after-image
		 * persists longer, while a lower value means it fades faster. Should be in
		 * the range `[0, 1]`.
		 *
		 * @type {Node<float>}
		 */
		this.damp = damp;

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
		 * The texture represents the pervious frame.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._textureNodeOld = texture( this._oldRT.texture );

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
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
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
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

		// make sure texture nodes point to correct render targets

		this._textureNode.value = this._compRT.texture;
		this._textureNodeOld.value = this._oldRT.texture;

		// composite

		_quadMesh.material = this._materialComposed;
		_quadMesh.name = 'AfterImage';

		renderer.setRenderTarget( this._compRT );
		_quadMesh.render( renderer );

		// swap

		const temp = this._oldRT;
		this._oldRT = this._compRT;
		this._compRT = temp;

		//

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
		const textureNodeOld = this._textureNodeOld;

		//

		textureNodeOld.uvNode = textureNode.uvNode || uv();

		const afterImg = Fn( () => {

			const texelOld = textureNodeOld.sample().toVar();
			const texelNew = textureNode.sample().toVar();

			const threshold = float( 0.1 ).toConst();

			// m acts as a mask. It's 1 if the previous pixel was "bright enough" (above the threshold) and 0 if it wasn't.
			const m = max( sign( texelOld.sub( threshold ) ), 0.0 );

			// This is where the after-image fades:
			//
			// - If m is 0, texelOld is multiplied by 0, effectively clearing the after-image for that pixel.
			// - If m is 1, texelOld is multiplied by "damp". Since "damp" is between 0 and 1, this reduces the color value of
			// texelOld, making it darker and causing it to fade.
			texelOld.mulAssign( this.damp.mul( m ) );

			return max( texelNew, texelOld );

		} );

		//

		const materialComposed = this._materialComposed || ( this._materialComposed = new NodeMaterial() );
		materialComposed.name = 'AfterImage';
		materialComposed.fragmentNode = afterImg();
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
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {(Node<float>|number)} [damp=0.96] - The damping intensity. A higher value means a stronger after image effect.
 * @returns {AfterImageNode}
 */
export const afterImage = ( node, damp ) => nodeObject( new AfterImageNode( convertToTexture( node ), nodeObject( damp ) ) );

export default AfterImageNode;
