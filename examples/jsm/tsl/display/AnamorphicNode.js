import { RenderTarget, Vector2, TempNode, QuadMesh, NodeMaterial, RendererUtils } from 'three/webgpu';
import { nodeObject, Fn, float, NodeUpdateType, uv, passTexture, uniform, convertToTexture, vec2, vec3, Loop, mix, luminance } from 'three/tsl';

/** @module AnamorphicNode **/

const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState;

/**
 * Post processing node for adding an anamorphic flare effect.
 *
 * @augments TempNode
 */
class AnamorphicNode extends TempNode {

	static get type() {

		return 'AnamorphicNode';

	}

	/**
	 * Constructs a new anamorphic node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 * @param {Node<float>} tresholdNode - The threshold is one option to control the intensity and size of the effect.
	 * @param {Node<float>} scaleNode - Defines the vertical scale of the flares.
	 * @param {Number} samples - More samples result in larger flares and a more expensive runtime behavior.
	 */
	constructor( textureNode, tresholdNode, scaleNode, samples ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * The threshold is one option to control the intensity and size of the effect.
		 *
		 * @type {Node<float>}
		 */
		this.tresholdNode = tresholdNode;

		/**
		 * Defines the vertical scale of the flares.
		 *
		 * @type {Node<float>}
		 */
		this.scaleNode = scaleNode;

		/**
		 * The color of the flares.
		 *
		 * @type {Node<vec3>}
		 */
		this.colorNode = vec3( 0.1, 0.0, 1.0 );

		/**
		 * More samples result in larger flares and a more expensive runtime behavior.
		 *
		 * @type {Node<float>}
		 */
		this.samples = samples;

		/**
		 * The resolution scale.
		 *
		 * @type {Vector2}
		 */
		this.resolution = new Vector2( 1, 1 );

		/**
		 * The internal render target of the effect.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._renderTarget = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._renderTarget.texture.name = 'anamorphic';

		/**
		 * A uniform node holding the inverse resolution value.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._invSize = uniform( new Vector2() );

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._renderTarget.texture );

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

		this._invSize.value.set( 1 / width, 1 / height );

		width = Math.max( Math.round( width * this.resolution.x ), 1 );
		height = Math.max( Math.round( height * this.resolution.y ), 1 );

		this._renderTarget.setSize( width, height );

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

		this._renderTarget.texture.type = map.type;

		const currentTexture = textureNode.value;

		_quadMesh.material = this._material;

		this.setSize( map.image.width, map.image.height );

		// render

		renderer.setRenderTarget( this._renderTarget );

		_quadMesh.render( renderer );

		// restore

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
		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.sample( uv );

		const threshold = ( color, threshold ) => mix( vec3( 0.0 ), color, luminance( color ).sub( threshold ).max( 0 ) );

		const anamorph = Fn( () => {

			const samples = this.samples;
			const halfSamples = Math.floor( samples / 2 );

			const total = vec3( 0 ).toVar();

			Loop( { start: - halfSamples, end: halfSamples }, ( { i } ) => {

				const softness = float( i ).abs().div( halfSamples ).oneMinus();

				const uv = vec2( uvNode.x.add( this._invSize.x.mul( i ).mul( this.scaleNode ) ), uvNode.y );
				const color = sampleTexture( uv );
				const pass = threshold( color, this.tresholdNode ).mul( softness );

				total.addAssign( pass );

			} );

			return total.mul( this.colorNode );

		} );

		//

		const material = this._material || ( this._material = new NodeMaterial() );
		material.name = 'Anamorphic';
		material.fragmentNode = anamorph();

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

		this._renderTarget.dispose();

	}

}

/**
 * TSL function for creating an anamorphic flare effect.
 *
 * @function
 * @param {TextureNode} node - The node that represents the input of the effect.
 * @param {Node<float> | Number} [threshold=0.9] - The threshold is one option to control the intensity and size of the effect.
 * @param {Node<float> | Number} [scale=3] - Defines the vertical scale of the flares.
 * @param {Number} [samples=32] - More samples result in larger flares and a more expensive runtime behavior.
 * @returns {AnamorphicNode}
 */
export const anamorphic = ( node, threshold = .9, scale = 3, samples = 32 ) => nodeObject( new AnamorphicNode( convertToTexture( node ), nodeObject( threshold ), nodeObject( scale ), samples ) );

export default AnamorphicNode;
