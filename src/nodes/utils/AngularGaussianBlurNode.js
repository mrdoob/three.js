import TempNode from '../core/TempNode.js';
import NodeError from '../core/NodeError.js';
import { NodeUpdateType } from '../core/constants.js';
import { context } from '../core/ContextNode.js';
import { nodeObject, float, vec2, vec3, Fn, If } from '../tsl/TSLBase.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import { textureSize } from '../accessors/TextureSizeNode.js';
import { positionWorldDirection } from '../accessors/Position.js';
import { materialEnvRotation } from '../accessors/MaterialProperties.js';
import { abs, clamp, floor, max, min, mix, smoothstep } from '../math/MathNode.js';
import { mul } from '../math/OperatorNode.js';
import { select } from '../math/ConditionalNode.js';
import { equirectDirection } from './EquirectUV.js';
import { CubeTexture } from '../../textures/CubeTexture.js';
import CubemapBlurGenerator from '../../renderers/common/extras/CubemapBlurGenerator.js';

// Face order: +X, +Y, +Z, -X, -Y, -Z.
const getFace = /*@__PURE__*/ Fn( ( [ direction ] ) => {

	const absDirection = vec3( abs( direction ) ).toVar();
	const face = float( - 1.0 ).toVar();

	If( absDirection.x.greaterThan( absDirection.z ), () => {

		If( absDirection.x.greaterThan( absDirection.y ), () => {

			face.assign( select( direction.x.greaterThan( 0.0 ), 0.0, 3.0 ) );

		} ).Else( () => {

			face.assign( select( direction.y.greaterThan( 0.0 ), 1.0, 4.0 ) );

		} );

	} ).Else( () => {

		If( absDirection.z.greaterThan( absDirection.y ), () => {

			face.assign( select( direction.z.greaterThan( 0.0 ), 2.0, 5.0 ) );

		} ).Else( () => {

			face.assign( select( direction.y.greaterThan( 0.0 ), 1.0, 4.0 ) );

		} );

	} );

	return face;

} ).setLayout( {
	name: 'getFace',
	type: 'float',
	inputs: [
		{ name: 'direction', type: 'vec3' }
	]
} );

const getUV = /*@__PURE__*/ Fn( ( [ direction, face ] ) => {

	const uv = vec2().toVar();

	If( face.equal( 0.0 ), () => {

		uv.assign( vec2( direction.z, direction.y ).div( abs( direction.x ) ) ); // pos x

	} ).ElseIf( face.equal( 1.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.z.negate() ).div( abs( direction.y ) ) ); // pos y

	} ).ElseIf( face.equal( 2.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.y ).div( abs( direction.z ) ) ); // pos z

	} ).ElseIf( face.equal( 3.0 ), () => {

		uv.assign( vec2( direction.z.negate(), direction.y ).div( abs( direction.x ) ) ); // neg x

	} ).ElseIf( face.equal( 4.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.z ).div( abs( direction.y ) ) ); // neg y

	} ).Else( () => {

		uv.assign( vec2( direction.x, direction.y ).div( abs( direction.z ) ) ); // neg z

	} );

	return mul( 0.5, uv.add( 1.0 ) );

} ).setLayout( {
	name: 'getUV',
	type: 'vec2',
	inputs: [
		{ name: 'direction', type: 'vec3' },
		{ name: 'face', type: 'float' }
	]
} );

// Direction (not normalized) of face coordinates in the getUV convention that may lie past the face
// edge. The texel grid continues into the neighbouring face at the same texel index along the edge, so
// coordinates past the edge land on the neighbour's texel centers rather than on the extrapolated face plane.
const cubeFaceDir = /*@__PURE__*/ Fn( ( [ face, uv ] ) => {

	const st = uv.mul( 2.0 ).sub( 1.0 ).toVar();
	const over = min( max( abs( st ).sub( 1.0 ), 0.0 ), 0.75 );
	st.assign( clamp( st, - 1.0, 1.0 ).div( over.x.oneMinus().mul( over.y.oneMinus() ) ) );

	const d0 = vec3( 1.0, st.y, st.x );
	const d1 = vec3( st.x.negate(), 1.0, st.y.negate() );
	const d2 = vec3( st.x.negate(), st.y, 1.0 );
	const d3 = vec3( - 1.0, st.y, st.x.negate() );
	const d4 = vec3( st.x.negate(), - 1.0, st.y );
	const d5 = vec3( st.x, st.y, - 1.0 );

	return select( face.lessThan( 0.5 ), d0, select( face.lessThan( 1.5 ), d1, select( face.lessThan( 2.5 ), d2, select( face.lessThan( 3.5 ), d3, select( face.lessThan( 4.5 ), d4, d5 ) ) ) ) );

} );

/**
 * Blurs a cube or equirectangular texture node once per frame.
 * PMREM textures are cube textures and should be passed through `cubeTexture()`.
 * Explicit 2D UVs select an equirectangular projection of the output.
 * Texture replacements in update callbacks must retain the input's type and projection.
 * Use `rtt()` with `autoUpdate: false` to cache a 2D projection of the result.
 * Call `dispose()` when the effect is no longer needed.
 *
 * @augments TempNode
 */
class AngularGaussianBlurNode extends TempNode {

	static get type() {

		return 'AngularGaussianBlurNode';

	}

	/**
	 * Constructs a new angular Gaussian blur node.
	 *
	 * @param {TextureNode} textureNode - The environment texture node to blur.
	 * @param {number} [amount=0] - The blur amount in the range `[0,1]`.
	 */
	constructor( textureNode, amount = 0 ) {

		super( 'vec3' );

		/**
		 * The environment texture node to blur.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * The blur amount in the range `[0,1]`.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.amount = amount;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isAngularGaussianBlurNode = true;

		const image = { width: 1, height: 1 };

		/**
		 * The placeholder used before the first render.
		 *
		 * @private
		 * @type {CubeTexture}
		 */
		this._defaultTexture = new CubeTexture( [ image, image, image, image, image, image ] );
		this._defaultTexture.isRenderTargetTexture = true;

		/**
		 * The cube texture node sampling the blurred cube map.
		 *
		 * @private
		 * @type {CubeTextureNode}
		 */
		this._cubeTextureNode = cubeTexture( this._defaultTexture );

		/**
		 * The render resources owned by each renderer.
		 *
		 * @private
		 * @type {Map<Renderer, Object>}
		 */
		this._rendererData = new Map();

		/**
		 * Updates the blurred cube map once per frame.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	updateBefore( frame ) {

		const textureNode = this.textureNode;
		const texture = textureNode && textureNode.value;

		if ( ! textureNode || textureNode.isTextureNode !== true || ! texture || texture.isTexture !== true || texture.isDepthTexture === true || texture.isData3DTexture === true || texture.isDataArrayTexture === true || texture.isCompressedArrayTexture === true || texture.is3DTexture === true || texture.isArrayTexture === true ) {

			throw new NodeError( 'AngularGaussianBlurNode: Expected a 2D or cube color texture node.', this.stackTrace );

		}

		if ( textureNode.sampler === false || textureNode.gatherNode !== null ) {

			throw new NodeError( 'AngularGaussianBlurNode: Texel loads and texture gathers are not supported.', this.stackTrace );

		}

		if ( ! Number.isFinite( this.amount ) ) {

			throw new NodeError( 'AngularGaussianBlurNode: The amount must be a finite number.', this.stackTrace );

		}

		const data = this._rendererData.get( frame.renderer );

		data.renderTarget = data.generator.fromNode( textureNode, this.amount, data.renderTarget, data.contextNode );
		this._cubeTextureNode.value = data.renderTarget.texture;

	}

	setup( builder ) {

		const { renderer } = builder;
		let data = this._rendererData.get( renderer );

		if ( data === undefined ) {

			data = { generator: new CubemapBlurGenerator( renderer ), renderTarget: null, contextNode: null };
			this._rendererData.set( renderer, data );

		}

		data.contextNode = context( builder.getSharedContext() );

		this._cubeTextureNode.onRenderUpdate( ( { renderer } ) => this._rendererData.get( renderer ).renderTarget?.texture || this._defaultTexture );

		return this._setupOutput( builder );

	}

	/**
	 * Builds the cubic reconstruction of the blurred cube map.
	 *
	 * @private
	 * @param {NodeBuilder} builder - The node builder.
	 * @return {Node<vec3>} The reconstructed color.
	 */
	_setupOutput( builder ) {

		const blurMap = this._cubeTextureNode;
		const textureNode = this.textureNode;
		let uvNode = textureNode.uvNode;

		if ( uvNode !== null && textureNode.isCubeTextureNode !== true ) uvNode = equirectDirection( uvNode );

		if ( ( uvNode === null || builder.context.forceUVContext === true ) && builder.context.getUV ) {

			uvNode = builder.context.getUV( textureNode, builder );

			if ( uvNode && builder.context.forceUVContext !== true ) uvNode = materialEnvRotation.mul( uvNode );

		}

		if ( ! uvNode ) uvNode = textureNode.isCubeTextureNode === true ? textureNode.getDefaultUV() : positionWorldDirection;

		// The blurred cube map's texels are only a few sigmas wide, bilinear magnification would show its
		// grid. Cubic B-spline reconstruction: four bilinear taps with the weights folded into the tap positions.
		return Fn( () => {

			const size = float( textureSize( blurMap, 0 ).x ).toVar();

			const direction = uvNode.toVar();
			const face = getFace( direction ).toVar();
			const uv = getUV( direction, face ).toVar();

			// texel i has its center at p = i
			const p = uv.mul( size ).sub( 0.5 );
			const i = floor( p ).toVar();
			const f = p.sub( i ).toVar();

			// cubic B-spline weights of texels i - 1 .. i + 2
			const f2 = f.mul( f ).toVar();
			const f3 = f2.mul( f ).toVar();
			const w0 = float( 1.0 ).sub( f.mul( 3.0 ) ).add( f2.mul( 3.0 ) ).sub( f3 ).div( 6.0 );
			const w1 = float( 4.0 ).sub( f2.mul( 6.0 ) ).add( f3.mul( 3.0 ) ).div( 6.0 );
			const w2 = float( 1.0 ).add( f.mul( 3.0 ) ).add( f2.mul( 3.0 ) ).sub( f3.mul( 3.0 ) ).div( 6.0 );
			const w3 = f3.div( 6.0 );

			// pair the taps: one bilinear fetch between i - 1 and i, one between i + 1 and i + 2
			const s0 = w0.add( w1 ).toVar();
			const s1 = w2.add( w3 ).toVar();
			const t0 = i.sub( 0.5 ).add( w1.div( s0 ) ).div( size ).toVar();
			const t1 = i.add( 1.5 ).add( w3.div( s1 ) ).div( size ).toVar();

			const tap = ( t ) => blurMap.sample( cubeFaceDir( face, t ) );

			const color = tap( vec2( t0.x, t0.y ) ).mul( s0.x.mul( s0.y ) )
				.add( tap( vec2( t1.x, t0.y ) ).mul( s1.x.mul( s0.y ) ) )
				.add( tap( vec2( t0.x, t1.y ) ).mul( s0.x.mul( s1.y ) ) )
				.add( tap( vec2( t1.x, t1.y ) ).mul( s1.x.mul( s1.y ) ) ).toVar();

			// the grids of the three faces meeting at a corner disagree within a texel or two, blend to bilinear there
			const st = abs( uv.mul( 2.0 ).sub( 1.0 ) );
			const texel = float( 2.0 ).div( size );
			const corner = smoothstep( texel, texel.mul( 2.0 ), min( st.x, st.y ).oneMinus() ).toVar();

			If( corner.lessThan( 1.0 ), () => {

				color.assign( mix( blurMap.sample( direction ), color, corner ) );

			} );

			return color;

		} )().context( { forceUVContext: false } );

	}

	/**
	 * Frees the render targets and materials owned by this effect.
	 */
	dispose() {

		for ( const { generator, renderTarget } of this._rendererData.values() ) {

			generator.dispose();
			if ( renderTarget !== null ) renderTarget.dispose();

		}

		this._rendererData.clear();
		this._defaultTexture.dispose();

		super.dispose();

	}

}

export default AngularGaussianBlurNode;

/**
 * TSL function for applying an angular Gaussian blur to an environment texture node.
 *
 * @tsl
 * @function
 * @param {TextureNode} textureNode - The environment texture node to blur.
 * @param {number} [amount=0] - The blur amount in the range `[0,1]`.
 * @returns {AngularGaussianBlurNode}
 */
export const angularGaussianBlur = ( textureNode, amount ) => nodeObject( new AngularGaussianBlurNode( textureNode, amount ) );
