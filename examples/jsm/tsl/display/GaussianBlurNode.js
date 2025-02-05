import { RenderTarget, Vector2, NodeMaterial, RendererUtils, QuadMesh, TempNode, NodeUpdateType } from 'three/webgpu';
import { nodeObject, Fn, If, float, uv, uniform, convertToTexture, vec2, vec4, passTexture, mul } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState;

const premult = /*@__PURE__*/ Fn( ( [ color ] ) => {

	return vec4( color.rgb.mul( color.a ), color.a );

} ).setLayout( {
	name: 'premult',
	type: 'vec4',
	inputs: [
		{ name: 'color', type: 'vec4' }
	]
} );

const unpremult = /*@__PURE__*/ Fn( ( [ color ] ) => {

	If( color.a.equal( 0.0 ), () => vec4( 0.0 ) );

	return vec4( color.rgb.div( color.a ), color.a );

} ).setLayout( {
	name: 'unpremult',
	type: 'vec4',
	inputs: [
		{ name: 'color', type: 'vec4' }
	]
} );

/**
 * Post processing node for creating a gaussian blur effect.
 *
 * @augments TempNode
 */
class GaussianBlurNode extends TempNode {

	static get type() {

		return 'GaussianBlurNode';

	}

	/**
	 * Constructs a new gaussian blur node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 * @param {Node<vec2|float>} directionNode - Defines the direction and radius of the blur.
	 * @param {number} sigma - Controls the kernel of the blur filter. Higher values mean a wider blur radius.
	 */
	constructor( textureNode, directionNode = null, sigma = 2 ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * Defines the direction and radius of the blur.
		 *
		 * @type {Node<vec2|float>}
		 */
		this.directionNode = directionNode;

		/**
		 * Controls the kernel of the blur filter. Higher values mean a wider blur radius.
		 *
		 * @type {number}
		 */
		this.sigma = sigma;

		/**
		 * A uniform node holding the inverse resolution value.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._invSize = uniform( new Vector2() );

		/**
		 * Gaussian blur is applied in two passes (horizontal, vertical).
		 * This node controls the direction of each pass.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._passDirection = uniform( new Vector2() );

		/**
		 * The render target used for the horizontal pass.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._horizontalRT = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._horizontalRT.texture.name = 'GaussianBlurNode.horizontal';

		/**
		 * The render target used for the vertical pass.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._verticalRT = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._verticalRT.texture.name = 'GaussianBlurNode.vertical';

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._verticalRT.texture );
		this._textureNode.uvNode = textureNode.uvNode;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * Controls the resolution of the effect.
		 *
		 * @type {Vector2}
		 * @default (1,1)
		 */
		this.resolution = new Vector2( 1, 1 );

		/**
		 * Whether the effect should use premultiplied alpha or not. Set this to `true`
		 * if you are going to blur texture input with transparency.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.premultipliedAlpha = false;

	}

	/**
	 * Sets the given premultiplied alpha value.
	 *
	 * @param {boolean} value - Whether the effect should use premultiplied alpha or not.
	 * @return {GaussianBlurNode} height - A reference to this node.
	 */
	setPremultipliedAlpha( value ) {

		this.premultipliedAlpha = value;

		return this;

	}

	/**
	 * Returns the premultiplied alpha value.
	 *
	 * @return {boolean} Whether the effect should use premultiplied alpha or not.
	 */
	getPremultipliedAlpha() {

		return this.premultipliedAlpha;

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setSize( width, height ) {

		width = Math.max( Math.round( width * this.resolution.x ), 1 );
		height = Math.max( Math.round( height * this.resolution.y ), 1 );

		this._invSize.value.set( 1 / width, 1 / height );
		this._horizontalRT.setSize( width, height );
		this._verticalRT.setSize( width, height );

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

		const currentTexture = textureNode.value;

		_quadMesh.material = this._material;

		this.setSize( map.image.width, map.image.height );

		const textureType = map.type;

		this._horizontalRT.texture.type = textureType;
		this._verticalRT.texture.type = textureType;

		// horizontal

		renderer.setRenderTarget( this._horizontalRT );

		this._passDirection.value.set( 1, 0 );

		_quadMesh.render( renderer );

		// vertical

		textureNode.value = this._horizontalRT.texture;
		renderer.setRenderTarget( this._verticalRT );

		this._passDirection.value.set( 0, 1 );

		_quadMesh.render( renderer );

		// restore

		textureNode.value = currentTexture;

		RendererUtils.restoreRendererState( renderer, _rendererState );

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
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const textureNode = this.textureNode;

		//

		const uvNode = uv();
		const directionNode = vec2( this.directionNode || 1 );

		let sampleTexture, output;

		if ( this.premultipliedAlpha ) {

			// https://lisyarus.github.io/blog/posts/blur-coefficients-generator.html

			sampleTexture = ( uv ) => premult( textureNode.sample( uv ) );
			output = ( color ) => unpremult( color );

		} else {

			sampleTexture = ( uv ) => textureNode.sample( uv );
			output = ( color ) => color;

		}

		const blur = Fn( () => {

			const kernelSize = 3 + ( 2 * this.sigma );
			const gaussianCoefficients = this._getCoefficients( kernelSize );

			const invSize = this._invSize;
			const direction = directionNode.mul( this._passDirection );

			const weightSum = float( gaussianCoefficients[ 0 ] ).toVar();
			const diffuseSum = vec4( sampleTexture( uvNode ).mul( weightSum ) ).toVar();

			for ( let i = 1; i < kernelSize; i ++ ) {

				const x = float( i );
				const w = float( gaussianCoefficients[ i ] );

				const uvOffset = vec2( direction.mul( invSize.mul( x ) ) ).toVar();

				const sample1 = sampleTexture( uvNode.add( uvOffset ) );
				const sample2 = sampleTexture( uvNode.sub( uvOffset ) );

				diffuseSum.addAssign( sample1.add( sample2 ).mul( w ) );
				weightSum.addAssign( mul( 2.0, w ) );

			}

			return output( diffuseSum.div( weightSum ) );

		} );

		//

		const material = this._material || ( this._material = new NodeMaterial() );
		material.fragmentNode = blur().context( builder.getSharedContext() );
		material.name = 'Gaussian_blur';
		material.needsUpdate = true;

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

		this._horizontalRT.dispose();
		this._verticalRT.dispose();

	}

	/**
	 * Computes gaussian coefficients depending on the given kernel radius.
	 *
	 * @private
	 * @param {number} kernelRadius - The kernel radius.
	 * @return {Array<number>}
	 */
	_getCoefficients( kernelRadius ) {

		const coefficients = [];

		for ( let i = 0; i < kernelRadius; i ++ ) {

			coefficients.push( 0.39894 * Math.exp( - 0.5 * i * i / ( kernelRadius * kernelRadius ) ) / kernelRadius );

		}

		return coefficients;

	}

}

export default GaussianBlurNode;

/**
 * TSL function for creating a gaussian blur node for post processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {Node<vec2|float>} directionNode - Defines the direction and radius of the blur.
 * @param {number} sigma - Controls the kernel of the blur filter. Higher values mean a wider blur radius.
 * @returns {GaussianBlurNode}
 */
export const gaussianBlur = ( node, directionNode, sigma ) => nodeObject( new GaussianBlurNode( convertToTexture( node ), directionNode, sigma ) );

/**
 * TSL function for creating a gaussian blur node for post processing with enabled premultiplied alpha.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {Node<vec2|float>} directionNode - Defines the direction and radius of the blur.
 * @param {number} sigma - Controls the kernel of the blur filter. Higher values mean a wider blur radius.
 * @returns {GaussianBlurNode}
 */
export const premultipliedGaussianBlur = ( node, directionNode, sigma ) => nodeObject( new GaussianBlurNode( convertToTexture( node ), directionNode, sigma ).setPremultipliedAlpha( true ) );
