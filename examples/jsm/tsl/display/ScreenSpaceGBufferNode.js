import { FloatType, NearestFilter, Node, NodeMaterial, NodeUpdateType, QuadMesh, RenderTarget, RendererUtils, UnsignedByteType, Vector2 } from 'three/webgpu';
import { Fn, If, Loop, context, float, ivec2, nodeObject, outputStruct, passTexture, property, screenCoordinate, textureLoad, textureSize, uniform, vec2, vec4 } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();

/**
 * Prepares a shared, nearest-sampled G-buffer for reduced-resolution screen-space
 * effects. Each footprint selects its nearest depth and copies the normal,
 * roughness and material properties from that same source texel. Depth is never
 * averaged across surfaces. Integer loads avoid ambiguous nearest filtering at
 * the boundaries between source texels.
 *
 * The depth attachment stores raw depth in R and the selected source UV in GB.
 * Use that UV when fetching full-resolution radiance so lighting and geometry
 * refer to the same surface. Full-resolution guides should still be retained for
 * temporal validation and edge-aware upsampling.
 *
 * @augments Node
 * @three_import import { screenSpaceGBuffer } from 'three/addons/tsl/display/ScreenSpaceGBufferNode.js';
 */
class ScreenSpaceGBufferNode extends Node {

	static get type() {

		return 'ScreenSpaceGBufferNode';

	}

	/**
	 * @param {TextureNode} depthNode - Raw device depth.
	 * @param {TextureNode} normalNode - Packed view normal in RGB, roughness in A.
	 * @param {TextureNode} materialNode - Base color in RGB, metalness in A.
	 * @param {Object} [options] - Options.
	 * @param {boolean} [options.reversedDepth] - Override the renderer depth convention.
	 */
	constructor( depthNode, normalNode, materialNode, { reversedDepth } = {} ) {

		super( 'vec4' );
		this.depthNode = depthNode;
		this.normalNode = normalNode;
		this.materialNode = materialNode;
		this.reversedDepth = reversedDepth;
		/** Effect resolution relative to the source G-buffer. @type {number} */
		this.resolutionScale = 0.5;
		this.updateBeforeType = NodeUpdateType.FRAME;
		this._resolution = uniform( new Vector2( 1, 1 ) );
		this._target = new RenderTarget( 1, 1, { count: 3, type: FloatType, minFilter: NearestFilter, magFilter: NearestFilter, depthBuffer: false } );
		this._target.textures[ 0 ].name = 'ScreenSpaceGBuffer.Depth';
		this._target.textures[ 1 ].name = 'ScreenSpaceGBuffer.NormalRoughness';
		this._target.textures[ 2 ].name = 'ScreenSpaceGBuffer.AlbedoMetalness';
		this._target.textures[ 1 ].type = UnsignedByteType;
		this._target.textures[ 2 ].type = UnsignedByteType;
		this._textures = this._target.textures.map( value => passTexture( this, value ) );
		this._material = new NodeMaterial();
		this._material.name = 'ScreenSpaceGBuffer';
		this._rendererState = {};

	}

	/**
	 * @param {'depth'|'normal'|'material'} [name='depth'] - Attachment.
	 * @return {PassTextureNode} The prepared guide texture.
	 */
	getTextureNode( name = 'depth' ) {

		return this._textures[ { depth: 0, normal: 1, material: 2 }[ name ] ];

	}

	/** @return {RenderTarget} Prepared guides. */
	getRenderTarget() {

		return this._target;

	}

	/**
	 * @param {number} width - Source width.
	 * @param {number} height - Source height.
	 */
	setSize( width, height ) {

		width = Math.max( 1, Math.floor( width * this.resolutionScale ) );
		height = Math.max( 1, Math.floor( height * this.resolutionScale ) );
		this._resolution.value.set( width, height );
		this._target.setSize( width, height );

	}

	/** @param {NodeFrame} frame - Current frame. */
	updateBefore( frame ) {

		const { renderer } = frame;
		// Resolve the producer before inspecting its dimensions or saving state.
		if ( this.depthNode.isPassTextureNode ) frame.updateBeforeNode( this.depthNode.passNode );
		const { width, height } = this.depthNode.value.image;
		this.setSize( width, height );
		this._rendererState = RendererUtils.resetRendererState( renderer, this._rendererState );
		renderer.setMRT( null );
		renderer.setRenderTarget( this._target );
		_quadMesh.material = this._material;
		_quadMesh.name = 'Screen-space G-buffer [ Prepare ]';
		_quadMesh.render( renderer );
		RendererUtils.restoreRendererState( renderer, this._rendererState );

	}

	/**
	 * @param {NodeBuilder} builder - Node builder.
	 * @return {PassTextureNode} Prepared depth and source coordinates.
	 */
	setup( builder ) {

		builder.getNodeProperties( this ).depthNode = this.depthNode;
		const reversed = this.reversedDepth ?? builder.renderer.reversedDepthBuffer;
		const selected = property( 'ivec2' );
		const prepare = Fn( () => {

			const size = vec2( textureSize( this.depthNode ) ).toConst();
			const pixel = screenCoordinate.floor().toConst();
			// Partition all source pixels, including odd trailing rows/columns.
			const begin = ivec2( pixel.mul( size ).div( this._resolution ).floor() ).toConst();
			const end = ivec2( pixel.add( 1 ).mul( size ).div( this._resolution ).floor().min( size ) ).toConst();
			selected.assign( begin );
			const depth = float( textureLoad( this.depthNode, begin ).r ).toVar();
			Loop( { start: begin.y, end: end.y, type: 'int', name: 'y', condition: '<' }, ( { y } ) => {

				Loop( { start: begin.x, end: end.x, type: 'int', name: 'x', condition: '<' }, ( { x } ) => {

					const coordinate = ivec2( x, y );
					const candidate = textureLoad( this.depthNode, coordinate ).r;
					If( reversed ? candidate.greaterThan( depth ) : candidate.lessThan( depth ), () => {

						depth.assign( candidate );
						selected.assign( coordinate );

					} );

				} );

			} );
			const sourceUV = vec2( selected ).add( 0.5 ).div( size );
			return vec4( depth, sourceUV, 1 );

		} )();
		this._material.fragmentNode = outputStruct( prepare, textureLoad( this.normalNode, selected ), textureLoad( this.materialNode, selected ) );
		this._material.contextNode = context( builder.getSharedContext() );
		this._material.needsUpdate = true;
		return this.getTextureNode();

	}

	/** Frees the prepared textures and material. */
	dispose() {

		super.dispose();
		this._target.dispose();
		this._material.dispose();

	}

}

export default ScreenSpaceGBufferNode;

/**
 * @tsl
 * @function
 * @param {TextureNode} depthNode - Raw device depth.
 * @param {TextureNode} normalNode - Packed view normal and roughness.
 * @param {TextureNode} materialNode - Base color and metalness.
 * @param {Object} [options] - Depth convention override.
 * @return {ScreenSpaceGBufferNode} Shared screen-space guides.
 */
export const screenSpaceGBuffer = ( depthNode, normalNode, materialNode, options ) => new ScreenSpaceGBufferNode( nodeObject( depthNode ), nodeObject( normalNode ), nodeObject( materialNode ), options );
