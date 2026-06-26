import { RenderTarget, Vector2, TempNode, NodeUpdateType, QuadMesh, RendererUtils, NodeMaterial } from 'three/webgpu';
import { convertToTexture, nodeObject, Fn, passTexture, uv, vec2, vec3, vec4, max, float, sub, int, Loop, fract, pow, distance } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();
let _rendererState;

/**
 * Post processing node for adding a bloom-based lens flare effect. This effect
 * requires that you extract the bloom of the scene via a bloom pass first.
 *
 * References:
 * - {@link https://john-chapman-graphics.blogspot.com/2013/02/pseudo-lens-flare.html}.
 * - {@link https://john-chapman.github.io/2017/11/05/pseudo-lens-flare.html}.
 *
 * @augments TempNode
 * @three_import import { lensflare } from 'three/addons/tsl/display/LensflareNode.js';
 */
class LensflareNode extends TempNode {

	static get type() {

		return 'LensflareNode';

	}

	/**
	 * Constructs a new lens flare node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the scene's bloom.
	 * @param {Object} params - The parameter object for configuring the effect.
	 * @param {Node<vec3> | Color} [params.ghostTint=vec3(1, 1, 1)] - Defines the tint of the flare/ghosts.
	 * @param {Node<float> | number} [params.threshold=float(0.5)] - Controls the size and strength of the effect. A higher threshold results in smaller flares.
	 * @param {Node<float> | number} [params.ghostSamples=float(4)] - Represents the number of flares/ghosts per bright spot which pivot around the center.
	 * @param {Node<float> | number} [params.ghostSpacing=float(0.25)] - Defines the spacing of the flares/ghosts.
	 * @param {Node<float> | number} [params.ghostAttenuationFactor=float(25)] - Defines the attenuation factor of flares/ghosts.
	 * @param {number} [params.downSampleRatio=4] - Defines how downsampling since the effect is usually not rendered at full resolution.
	 */
	constructor( textureNode, params = {} ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the scene's bloom.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		const {
			ghostTint = vec3( 1, 1, 1 ),
			threshold = float( 0.5 ),
			ghostSamples = float( 4 ),
			ghostSpacing = float( 0.25 ),
			ghostAttenuationFactor = float( 25 ),
			downSampleRatio = 4
		} = params;

		/**
		 * Defines the tint of the flare/ghosts.
		 *
		 * @type {Node<vec3>}
		 */
		this.ghostTintNode = nodeObject( ghostTint );

		/**
		 * Controls the size and strength of the effect. A higher threshold results in smaller flares.
		 *
		 * @type {Node<float>}
		 */
		this.thresholdNode = nodeObject( threshold );

		/**
		 * Represents the number of flares/ghosts per bright spot which pivot around the center.
		 *
		 * @type {Node<float>}
		 */
		this.ghostSamplesNode = nodeObject( ghostSamples );

		/**
		 * Defines the spacing of the flares/ghosts.
		 *
		 * @type {Node<float>}
		 */
		this.ghostSpacingNode = nodeObject( ghostSpacing );

		/**
		 * Defines the attenuation factor of flares/ghosts.
		 *
		 * @type {Node<float>}
		 */
		this.ghostAttenuationFactorNode = nodeObject( ghostAttenuationFactor );

		/**
		 * Defines how downsampling since the effect is usually not rendered at full resolution.
		 *
		 * @type {number}
		 */
		this.downSampleRatio = downSampleRatio;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * The internal render target of the effect.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._renderTarget = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._renderTarget.texture.name = 'LensflareNode';

		/**
		 * The node material that holds the effect's TSL code.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._material = new NodeMaterial();
		this._material.name = 'LensflareNode';

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._renderTarget.texture );

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

		const resx = Math.round( width / this.downSampleRatio );
		const resy = Math.round( height / this.downSampleRatio );

		this._renderTarget.setSize( resx, resy );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		_quadMesh.material = this._material;

		// clear

		renderer.setMRT( null );

		// lensflare

		renderer.setRenderTarget( this._renderTarget );
		_quadMesh.render( renderer );

		// restore

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const lensflare = Fn( () => {

			// flip uvs so lens flare pivot around the image center

			const texCoord = uv().oneMinus().toVar();

			// ghosts are positioned along this vector

			const ghostVec = sub( vec2( 0.5 ), texCoord ).mul( this.ghostSpacingNode ).toVar();

			// sample ghosts

			const result = vec4().toVar();

			Loop( { start: int( 0 ), end: int( this.ghostSamplesNode ), type: 'int', condition: '<' }, ( { i } ) => {

				// use fract() to ensure that the texture coordinates wrap around

				const sampleUv = fract( texCoord.add( ghostVec.mul( float( i ) ) ) ).toVar();

				// reduce contributions from samples at the screen edge

				const d = distance( sampleUv, vec2( 0.5 ) );
				const weight = pow( d.oneMinus(), this.ghostAttenuationFactorNode );

				// accumulate

				let sample = this.textureNode.sample( sampleUv ).rgb;

				sample = max( sample.sub( this.thresholdNode ), vec3( 0 ) ).mul( this.ghostTintNode );

				result.addAssign( sample.mul( weight ) );

			} );

			return result;

		} );

		this._material.fragmentNode = lensflare().context( builder.getSharedContext() );
		this._material.needsUpdate = true;

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._renderTarget.dispose();
		this._material.dispose();

	}

}

export default LensflareNode;

/**
 * TSL function for creating a bloom-based lens flare effect.
 *
 * @tsl
 * @function
 * @param {TextureNode} node - The node that represents the scene's bloom.
 * @param {Object} params - The parameter object for configuring the effect.
 * @param {Node<vec3> | Color} [params.ghostTint=vec3(1, 1, 1)] - Defines the tint of the flare/ghosts.
 * @param {Node<float> | number} [params.threshold=float(0.5)] - Controls the size and strength of the effect. A higher threshold results in smaller flares.
 * @param {Node<float> | number} [params.ghostSamples=float(4)] - Represents the number of flares/ghosts per bright spot which pivot around the center.
 * @param {Node<float> | number} [params.ghostSpacing=float(0.25)] - Defines the spacing of the flares/ghosts.
 * @param {Node<float> | number} [params.ghostAttenuationFactor=float(25)] - Defines the attenuation factor of flares/ghosts.
 * @param {number} [params.downSampleRatio=4] - Defines how downsampling since the effect is usually not rendered at full resolution.
 * @returns {LensflareNode}
 */
export const lensflare = ( node, params ) => new LensflareNode( convertToTexture( node ), params );
