import { RenderTarget, Vector2, NodeMaterial, RendererUtils, QuadMesh, TempNode, NodeUpdateType } from 'three/webgpu';
import { nodeObject, Fn, float, uv, uniform, convertToTexture, vec2, vec4, passTexture, premultiplyAlpha, unpremultiplyAlpha } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState;

/**
 * Post processing node for creating a gaussian blur effect.
 *
 * @augments TempNode
 * @three_import import { gaussianBlur, premultipliedGaussianBlur } from 'three/addons/tsl/display/GaussianBlurNode.js';
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
	 * @param {Object} [options={}] - Additional options for the gaussian blur effect.
	 * @param {boolean} [options.premultipliedAlpha=false] - Whether to use premultiplied alpha for the blur effect.
	 * @param {Vector2} [options.resolution=new Vector2(1, 1)] - The resolution of the effect. 0.5 means half the resolution of the texture node.
	 */
	constructor( textureNode, directionNode = null, sigma = 4, options = {} ) {

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
		 * The resolution scale.
		 *
		 * @type {float}
		 * @default (1)
		 */
		this.resolutionScale = options.resolutionScale || 1;

		/**
		 * Whether the effect should use premultiplied alpha or not. Set this to `true`
		 * if you are going to blur texture input with transparency.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.premultipliedAlpha = options.premultipliedAlpha || false;

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setSize( width, height ) {

		width = Math.max( Math.round( width * this.resolutionScale ), 1 );
		height = Math.max( Math.round( height * this.resolutionScale ), 1 );

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

			sampleTexture = ( uv ) => premultiplyAlpha( textureNode.sample( uv ) );
			output = ( color ) => unpremultiplyAlpha( color );

		} else {

			sampleTexture = ( uv ) => textureNode.sample( uv );
			output = ( color ) => color;

		}

		const blur = Fn( () => {

			const kernelSize = 3 + ( 2 * this.sigma );
			const gaussianCoefficients = this._getCoefficients( kernelSize );

			const invSize = this._invSize;
			const direction = directionNode.mul( this._passDirection );

			const diffuseSum = vec4( sampleTexture( uvNode ).mul( gaussianCoefficients[ 0 ] ) ).toVar();

			for ( let i = 1; i < kernelSize; i ++ ) {

				const x = float( i );
				const w = float( gaussianCoefficients[ i ] );

				const uvOffset = vec2( direction.mul( invSize.mul( x ) ) ).toVar();

				const sample1 = sampleTexture( uvNode.add( uvOffset ) );
				const sample2 = sampleTexture( uvNode.sub( uvOffset ) );

				diffuseSum.addAssign( sample1.add( sample2 ).mul( w ) );

			}

			return output( diffuseSum );

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
		const sigma = kernelRadius / 3;

		for ( let i = 0; i < kernelRadius; i ++ ) {

			coefficients.push( 0.39894 * Math.exp( - 0.5 * i * i / ( sigma * sigma ) ) / sigma );

		}

		return coefficients;

	}

	/**
	 * The resolution scale.
	 *
	 * @deprecated
	 * @type {Vector2}
	 * @default {(1,1)}
	 */
	get resolution() {

		console.warn( 'THREE.GaussianBlurNode: The "resolution" property has been renamed to "resolutionScale" and is now of type `number`.' ); // @deprecated r180

		return new Vector2( this.resolutionScale, this.resolutionScale );

	}

	set resolution( value ) {

		console.warn( 'THREE.GaussianBlurNode: The "resolution" property has been renamed to "resolutionScale" and is now of type `number`.' ); // @deprecated r180

		this.resolutionScale = value.x;

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
 * @param {Object} [options={}] - Additional options for the gaussian blur effect.
 * @param {boolean} [options.premultipliedAlpha=false] - Whether to use premultiplied alpha for the blur effect.
 * @param {Vector2} [options.resolution=new Vector2(1, 1)] - The resolution of the effect. 0.5 means half the resolution of the texture node.
 * @returns {GaussianBlurNode}
 */
export const gaussianBlur = ( node, directionNode, sigma, options = {} ) => nodeObject( new GaussianBlurNode( convertToTexture( node ), directionNode, sigma, options ) );

/**
 * TSL function for creating a gaussian blur node for post processing with enabled premultiplied alpha.
 *
 * @tsl
 * @function
 * @deprecated  since r180. Use `gaussianBlur()` with `premultipliedAlpha: true` option instead.
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {Node<vec2|float>} directionNode - Defines the direction and radius of the blur.
 * @param {number} sigma - Controls the kernel of the blur filter. Higher values mean a wider blur radius.
 * @returns {GaussianBlurNode}
 */
export function premultipliedGaussianBlur( node, directionNode, sigma ) {

	console.warn( 'THREE.TSL: "premultipliedGaussianBlur()" is deprecated. Use "gaussianBlur()" with "premultipliedAlpha: true" option instead.' ); // deprecated, r180

	return gaussianBlur( node, directionNode, sigma, { premultipliedAlpha: true } );

}
