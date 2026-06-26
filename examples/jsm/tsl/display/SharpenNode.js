import { HalfFloatType, RenderTarget, Vector2, NodeMaterial, RendererUtils, QuadMesh, TempNode, NodeUpdateType } from 'three/webgpu';
import { Fn, float, vec3, vec4, ivec2, int, uv, floor, abs, max, min, exp2, nodeObject, passTexture, textureSize, textureLoad, convertToTexture } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

/**
 * Post processing node for contrast-adaptive sharpening (RCAS).
 *
 * Reference: {@link https://gpuopen.com/fidelityfx-superresolution/}.
 *
 * @augments TempNode
 * @three_import import { sharpen } from 'three/addons/tsl/display/SharpenNode.js';
 */
class SharpenNode extends TempNode {

	static get type() {

		return 'SharpenNode';

	}

	/**
	 * Constructs a new sharpen node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 * @param {Node<float>} [sharpness=0.2] - Sharpening strength. 0 = maximum sharpening, 2 = no sharpening.
	 * @param {Node<bool>} [denoise=false] - Whether to attenuate sharpening in noisy areas.
	 */
	constructor( textureNode, sharpness = 0.2, denoise = false ) {

		super( 'vec4' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSharpenNode = true;

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * Sharpening strength. 0 = maximum, 2 = none.
		 *
		 * @type {Node<float>}
		 * @default 0.2
		 */
		this.sharpness = nodeObject( sharpness );

		/**
		 * Whether to attenuate sharpening in noisy areas.
		 *
		 * @type {Node<bool>}
		 * @default false
		 */
		this.denoise = nodeObject( denoise );

		/**
		 * The render target for the sharpening pass.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._renderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._renderTarget.texture.name = 'SharpenNode.output';

		/**
		 * The result of the effect as a texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._renderTarget.texture );

		/**
		 * The material for the sharpening pass.
		 *
		 * @private
		 * @type {?NodeMaterial}
		 */
		this._material = null;

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
	 * Sets the output size of the effect.
	 *
	 * @param {number} width - The width in pixels.
	 * @param {number} height - The height in pixels.
	 */
	setSize( width, height ) {

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

		renderer.getDrawingBufferSize( _size );
		this.setSize( _size.x, _size.y );

		renderer.setRenderTarget( this._renderTarget );

		_quadMesh.material = this._material;
		_quadMesh.name = 'Sharpen [ RCAS ]';
		_quadMesh.render( renderer );

		//

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
		const inputTex = textureNode.value;

		// RCAS: Robust Contrast-Adaptive Sharpening.
		//
		// Ported from AMD FidelityFX FSR 1 (ffx_fsr1.h). Uses a 5-tap
		// cross pattern (center + up/down/left/right) to compute a
		// per-pixel sharpening weight that is automatically limited by
		// local contrast to avoid ringing. An optional noise-attenuation
		// factor reduces sharpening in noisy areas.

		const rcas = Fn( () => {

			const targetUV = uv();
			const texSize = textureSize( textureLoad( inputTex ) );

			const p = ivec2( int( floor( targetUV.x.mul( texSize.x ) ) ), int( floor( targetUV.y.mul( texSize.y ) ) ) ).toConst();

			const e = textureLoad( inputTex, p );
			const b = textureLoad( inputTex, p.add( ivec2( 0, - 1 ) ) );
			const d = textureLoad( inputTex, p.add( ivec2( - 1, 0 ) ) );
			const f = textureLoad( inputTex, p.add( ivec2( 1, 0 ) ) );
			const h = textureLoad( inputTex, p.add( ivec2( 0, 1 ) ) );

			// Approximate luminance (luma times 2).

			const luma = ( s ) => s.g.add( s.b.add( s.r ).mul( 0.5 ) );

			const bL = luma( b );
			const dL = luma( d );
			const eL = luma( e );
			const fL = luma( f );
			const hL = luma( h );

			// Sharpening amount from user parameter.

			const con = exp2( this.sharpness.negate() ).toConst();

			// Min and max of ring.

			const mn4 = min( min( b.rgb, d.rgb ), min( f.rgb, h.rgb ) ).toConst();
			const mx4 = max( max( b.rgb, d.rgb ), max( f.rgb, h.rgb ) ).toConst();

			// Compute adaptive lobe weight.
			// Limiters based on how much sharpening the local contrast can tolerate.

			const RCAS_LIMIT = float( 0.25 - 1.0 / 16.0 ).toConst();

			const hitMin = min( mn4, e.rgb ).div( mx4.mul( 4.0 ) ).toConst();
			const hitMax = vec3( 1.0 ).sub( max( mx4, e.rgb ) ).div( mn4.mul( 4.0 ).sub( 4.0 ) ).toConst();
			const lobeRGB = max( hitMin.negate(), hitMax ).toConst();

			const lobe = max(
				RCAS_LIMIT.negate(),
				min( max( lobeRGB.r, max( lobeRGB.g, lobeRGB.b ) ), float( 0.0 ) )
			).mul( con ).toConst();

			// Noise attenuation.

			const nz = bL.add( dL ).add( fL ).add( hL ).mul( 0.25 ).sub( eL ).toConst();
			const nzRange = max( max( bL, dL ), max( eL, max( fL, hL ) ) ).sub( min( min( bL, dL ), min( eL, min( fL, hL ) ) ) ).toConst();
			const nzFactor = float( 1.0 ).sub( abs( nz ).div( max( nzRange, float( 1.0 / 65536.0 ) ) ).saturate().mul( 0.5 ) ).toConst();

			const effectiveLobe = this.denoise.equal( true ).select( lobe.mul( nzFactor ), lobe ).toConst();

			// Resolve: weighted blend of cross neighbors and center.

			const result = b.rgb.add( d.rgb ).add( f.rgb ).add( h.rgb ).mul( effectiveLobe ).add( e.rgb )
				.div( effectiveLobe.mul( 4.0 ).add( 1.0 ) ).toConst();

			return vec4( result, e.a );

		} );

		//

		const context = builder.getSharedContext();

		const material = this._material || ( this._material = new NodeMaterial() );
		material.fragmentNode = rcas().context( context );
		material.name = 'Sharpen_RCAS';
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

		this._renderTarget.dispose();

		if ( this._material !== null ) this._material.dispose();

	}

}

export default SharpenNode;

/**
 * TSL function for creating a sharpen node for post processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {(number|Node<float>)} [sharpness=0.2] - Sharpening strength. 0 = maximum, 2 = none.
 * @param {(boolean|Node<bool>)} [denoise=false] - Whether to attenuate sharpening in noisy areas.
 * @returns {SharpenNode}
 */
export const sharpen = ( node, sharpness, denoise ) => new SharpenNode( convertToTexture( node ), sharpness, denoise );
