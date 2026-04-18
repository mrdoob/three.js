import { HalfFloatType, RenderTarget, Vector2, NodeMaterial, RendererUtils, QuadMesh, TempNode, NodeUpdateType } from 'three/webgpu';
import { Fn, float, vec2, vec3, vec4, ivec2, int, uv, floor, fract, abs, max, min, clamp, saturate, sqrt, select, exp2, nodeObject, passTexture, textureSize, textureLoad, convertToTexture } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

/**
 * Post processing node for applying AMD FidelityFX Super Resolution 1 (FSR 1).
 *
 * Combines two passes:
 * - **EASU** (Edge-Adaptive Spatial Upsampling): Uses 12 texture samples in a cross pattern
 *   to detect local edge direction, then shapes an approximate Lanczos2 kernel into an
 *   ellipse aligned with the detected edge.
 * - **RCAS** (Robust Contrast-Adaptive Sharpening): Uses a 5-tap cross pattern to apply
 *   contrast-aware sharpening that is automatically limited per-pixel to avoid artifacts.
 *
 * Note: Only use FSR 1 if your application is fragment-shader bound and cannot afford to render
 * at full resolution. FSR 1 adds its own overhead, so simply shaded scenes will render faster
 * at native resolution without it. Besides, FSR 1 should always be used with an anti-aliased
 * source image.
 *
 * Reference: {@link https://gpuopen.com/fidelityfx-superresolution/}.
 *
 * @augments TempNode
 * @three_import import { fsr1 } from 'three/addons/tsl/display/fsr1/FSR1Node.js';
 */
class FSR1Node extends TempNode {

	static get type() {

		return 'FSR1Node';

	}

	/**
	 * Constructs a new FSR 1 node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 * @param {Node<float>} [sharpness=0.2] - RCAS sharpening strength. 0 = maximum sharpening, 2 = no sharpening.
	 * @param {Node<bool>} [denoise=false] - Whether to attenuate RCAS sharpening in noisy areas.
	 */
	constructor( textureNode, sharpness = 0.2, denoise = false ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * RCAS sharpening strength. 0 = maximum, 2 = none.
		 *
		 * @type {Node<float>}
		 */
		this.sharpness = nodeObject( sharpness );

		/**
		 * Whether to attenuate RCAS sharpening in noisy areas.
		 *
		 * @type {Node<bool>}
		 */
		this.denoise = nodeObject( denoise );

		/**
		 * The render target for the EASU upscale pass.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._easuRT = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._easuRT.texture.name = 'FSR1Node.easu';

		/**
		 * The render target for the RCAS sharpen pass.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._rcasRT = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._rcasRT.texture.name = 'FSR1Node.rcas';

		/**
		 * The result of the effect as a texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._rcasRT.texture );

		/**
		 * The material for the EASU pass.
		 *
		 * @private
		 * @type {?NodeMaterial}
		 */
		this._easuMaterial = null;

		/**
		 * The material for the RCAS pass.
		 *
		 * @private
		 * @type {?NodeMaterial}
		 */
		this._rcasMaterial = null;

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

		this._easuRT.setSize( width, height );
		this._rcasRT.setSize( width, height );

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

		// EASU pass

		renderer.setRenderTarget( this._easuRT );

		_quadMesh.material = this._easuMaterial;
		_quadMesh.name = 'FSR1 [ EASU Pass ]';
		_quadMesh.render( renderer );

		// RCAS pass

		renderer.setRenderTarget( this._rcasRT );

		_quadMesh.material = this._rcasMaterial;
		_quadMesh.name = 'FSR1 [ RCAS Pass ]';
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

		// Note on performance: Compared to the orginal FSR1 code, texture sampling does
		// not make use of textureGather() yet. This is only available with WebGPU so the
		// WebGL 2 backend needs a fallback. Besides, in WebGPU and WebGL 2 we also
		// can't make use of packed math (e.g. FP16) which would considerably lower
		// the arithmetic costs (e.g. two 16-bit ops in parallel).

		// Accumulate edge direction and length for one bilinear quadrant.

		const _accumulateEdge = ( dir, len, w, aL, bL, cL, dL, eL ) => {

			const dc = dL.sub( cL ).toConst();
			const cb = cL.sub( bL ).toConst();
			const dirX = dL.sub( bL ).toConst();
			const lenX = max( abs( dc ), abs( cb ) ).toConst();
			const sLenX = saturate( abs( dirX ).div( max( lenX, float( 1.0 / 65536.0 ) ) ) ).toConst();

			dir.x.addAssign( dirX.mul( w ) );
			len.addAssign( sLenX.mul( sLenX ).mul( w ) );

			const ec = eL.sub( cL ).toConst();
			const ca = cL.sub( aL ).toConst();
			const dirY = eL.sub( aL ).toConst();
			const lenY = max( abs( ec ), abs( ca ) ).toConst();
			const sLenY = saturate( abs( dirY ).div( max( lenY, float( 1.0 / 65536.0 ) ) ) ).toConst();

			dir.y.addAssign( dirY.mul( w ) );
			len.addAssign( sLenY.mul( sLenY ).mul( w ) );

		};

		// Compute an approximate Lanczos2 tap weight and accumulate.

		const _accumulateTap = ( aC, aW, offset, dir, len2, lob, clp, color ) => {

			const vx = offset.x.mul( dir.x ).add( offset.y.mul( dir.y ) ).toConst();
			const vy = offset.x.mul( dir.y ).negate().add( offset.y.mul( dir.x ) ).toConst();

			const sx = vx.mul( len2.x ).toConst();
			const sy = vy.mul( len2.y ).toConst();
			const d2 = min( sx.mul( sx ).add( sy.mul( sy ) ), clp ).toConst();

			const wB = d2.mul( 2.0 / 5.0 ).sub( 1.0 ).toConst();
			const wA = d2.mul( lob ).sub( 1.0 ).toConst();
			const w = wB.mul( wB ).mul( 25.0 / 16.0 ).sub( 25.0 / 16.0 - 1.0 ).mul( wA.mul( wA ) ).toConst();

			aC.addAssign( color.mul( w ) );
			aW.addAssign( w );

		};

		// EASU pass: edge-adaptive spatial upsampling.

		const easu = Fn( () => {

			const targetUV = uv();
			const texSize = vec2( textureSize( textureNode ) );

			const pp = targetUV.mul( texSize ).sub( 0.5 ).toConst();
			const fp = floor( pp ).toConst();
			const f = fract( pp ).toConst();

			// Fetch exact texel values at integer coordinates (no filtering).

			const ifp = ivec2( int( fp.x ), int( fp.y ) ).toConst();
			const tap = ( dx, dy ) => textureLoad( inputTex, ifp.add( ivec2( dx, dy ) ) );

			// 12-tap cross pattern:
			//       b c
			//     e f g h
			//     i j k l
			//       n o

			const sB = tap( 0, - 1 ), sC = tap( 1, - 1 );
			const sE = tap( - 1, 0 ), sF = tap( 0, 0 ), sG = tap( 1, 0 ), sH = tap( 2, 0 );
			const sI = tap( - 1, 1 ), sJ = tap( 0, 1 ), sK = tap( 1, 1 ), sL = tap( 2, 1 );
			const sN = tap( 0, 2 ), sO = tap( 1, 2 );

			// Approximate luminance for edge detection.

			const luma = ( s ) => s.r.mul( 0.5 ).add( s.g ).add( s.b.mul( 0.5 ) );

			const bL = luma( sB ), cL = luma( sC );
			const eL = luma( sE ), fL = luma( sF ), gL = luma( sG ), hL = luma( sH );
			const iL = luma( sI ), jL = luma( sJ ), kL = luma( sK ), lL = luma( sL );
			const nL = luma( sN ), oL = luma( sO );

			// Accumulate edge direction and length from 4 bilinear quadrants.

			const dir = vec2( 0 ).toVar();
			const len = float( 0 ).toVar();

			const w0 = float( 1 ).sub( f.x ).mul( float( 1 ).sub( f.y ) ).toConst();
			const w1 = f.x.mul( float( 1 ).sub( f.y ) ).toConst();
			const w2 = float( 1 ).sub( f.x ).mul( f.y ).toConst();
			const w3 = f.x.mul( f.y ).toConst();

			_accumulateEdge( dir, len, w0, bL, eL, fL, gL, jL );
			_accumulateEdge( dir, len, w1, cL, fL, gL, hL, kL );
			_accumulateEdge( dir, len, w2, fL, iL, jL, kL, nL );
			_accumulateEdge( dir, len, w3, gL, jL, kL, lL, oL );

			// Normalize direction, defaulting to (1, 0) when gradient is negligible.

			const dirSq = dir.x.mul( dir.x ).add( dir.y.mul( dir.y ) ).toConst();
			const zro = dirSq.lessThan( 1.0 / 32768.0 ).toConst();
			const rDirLen = float( 1.0 ).div( sqrt( max( dirSq, float( 1.0 / 32768.0 ) ) ) ).toConst();

			dir.x.assign( select( zro, float( 1.0 ), dir.x ) );
			dir.mulAssign( select( zro, float( 1.0 ), rDirLen ) );

			// Shape the kernel based on edge strength.

			len.assign( len.mul( 0.5 ) );
			len.mulAssign( len );

			// Stretch factor: 1.0 for axis-aligned edges, sqrt(2) on diagonals.

			const stretch = dir.x.mul( dir.x ).add( dir.y.mul( dir.y ) ).div( max( abs( dir.x ), abs( dir.y ) ) ).toConst();

			// Anisotropic lengths: x stretches along edge, y shrinks perpendicular.

			const len2 = vec2(
				float( 1.0 ).add( stretch.sub( 1.0 ).mul( len ) ),
				float( 1.0 ).sub( len.mul( 0.5 ) )
			).toConst();

			// Negative lobe: strong on flat areas (0.5), reduced on edges (0.21).

			const lob = float( 0.5 ).add( float( 1.0 / 4.0 - 0.04 - 0.5 ).mul( len ) ).toConst();
			const clp = float( 1.0 ).div( lob ).toConst();

			// Accumulate weighted taps.

			const aC = vec4( 0 ).toVar();
			const aW = float( 0 ).toVar();

			_accumulateTap( aC, aW, vec2( 0, - 1 ).sub( f ), dir, len2, lob, clp, sB );
			_accumulateTap( aC, aW, vec2( 1, - 1 ).sub( f ), dir, len2, lob, clp, sC );
			_accumulateTap( aC, aW, vec2( - 1, 0 ).sub( f ), dir, len2, lob, clp, sE );
			_accumulateTap( aC, aW, vec2( 0, 0 ).sub( f ), dir, len2, lob, clp, sF );
			_accumulateTap( aC, aW, vec2( 1, 0 ).sub( f ), dir, len2, lob, clp, sG );
			_accumulateTap( aC, aW, vec2( 2, 0 ).sub( f ), dir, len2, lob, clp, sH );
			_accumulateTap( aC, aW, vec2( - 1, 1 ).sub( f ), dir, len2, lob, clp, sI );
			_accumulateTap( aC, aW, vec2( 0, 1 ).sub( f ), dir, len2, lob, clp, sJ );
			_accumulateTap( aC, aW, vec2( 1, 1 ).sub( f ), dir, len2, lob, clp, sK );
			_accumulateTap( aC, aW, vec2( 2, 1 ).sub( f ), dir, len2, lob, clp, sL );
			_accumulateTap( aC, aW, vec2( 0, 2 ).sub( f ), dir, len2, lob, clp, sN );
			_accumulateTap( aC, aW, vec2( 1, 2 ).sub( f ), dir, len2, lob, clp, sO );

			// Normalize.

			aC.divAssign( aW );

			// Anti-ringing: clamp to min/max of the 4 nearest samples (f, g, j, k).

			const min4 = min( min( sF, sG ), min( sJ, sK ) ).toConst();
			const max4 = max( max( sF, sG ), max( sJ, sK ) ).toConst();

			return clamp( aC, min4, max4 );

		} );

		// RCAS pass: robust contrast-adaptive sharpening.

		const easuTex = this._easuRT.texture;

		const rcas = Fn( () => {

			const targetUV = uv();
			const texSize = vec2( textureSize( textureLoad( easuTex ) ) );

			const p = ivec2( int( floor( targetUV.x.mul( texSize.x ) ) ), int( floor( targetUV.y.mul( texSize.y ) ) ) ).toConst();

			const e = textureLoad( easuTex, p );
			const b = textureLoad( easuTex, p.add( ivec2( 0, - 1 ) ) );
			const d = textureLoad( easuTex, p.add( ivec2( - 1, 0 ) ) );
			const f = textureLoad( easuTex, p.add( ivec2( 1, 0 ) ) );
			const h = textureLoad( easuTex, p.add( ivec2( 0, 1 ) ) );

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

		const easuMaterial = this._easuMaterial || ( this._easuMaterial = new NodeMaterial() );
		easuMaterial.fragmentNode = easu().context( context );
		easuMaterial.name = 'FSR1_EASU';
		easuMaterial.needsUpdate = true;

		const rcasMaterial = this._rcasMaterial || ( this._rcasMaterial = new NodeMaterial() );
		rcasMaterial.fragmentNode = rcas().context( context );
		rcasMaterial.name = 'FSR1_RCAS';
		rcasMaterial.needsUpdate = true;

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

		this._easuRT.dispose();
		this._rcasRT.dispose();

		if ( this._easuMaterial !== null ) this._easuMaterial.dispose();
		if ( this._rcasMaterial !== null ) this._rcasMaterial.dispose();

	}

}

export default FSR1Node;

/**
 * TSL function for creating an FSR 1 node for post processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {(number|Node<float>)} [sharpness=0.2] - RCAS sharpening strength. 0 = maximum, 2 = none.
 * @param {(boolean|Node<bool>)} [denoise=false] - Whether to attenuate RCAS sharpening in noisy areas.
 * @returns {FSR1Node}
 */
export const fsr1 = ( node, sharpness, denoise ) => new FSR1Node( convertToTexture( node ), sharpness, denoise );
