import { FloatType, NearestFilter, Node, NodeMaterial, NodeUpdateType, QuadMesh, RendererUtils, RenderTarget, RedFormat, Vector2 } from 'three/webgpu';
import { Fn, If, Loop, context, float, ivec2, nodeObject, outputStruct, passTexture, screenCoordinate, textureLoad, uniform, uvec2, vec2, vec3, vec4 } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState;

/**
 * Downsamples the scene's depth and further screen-space inputs like normals for effects
 * that are computed in a reduced resolution.
 *
 * Each texel holds the nearest depth of the texels it covers, and all other inputs are
 * taken from the texel holding that depth. The inputs of an effect are thus consistent
 * and the effect itself doesn't have to know about the reduced resolution.
 *
 * The resolution is halved per level by rounding down, so the last texel of an odd sized
 * level also covers the remaining row or column.
 *
 * ```js
 * const downsample = depthAwareDownsample( scenePassDepth, { normal: scenePassNormal } );
 *
 * const aoPass = ao( downsample.getTextureNode( 'depth' ), downsample.getTextureNode( 'normal' ), camera );
 * ```
 *
 * @augments Node
 * @three_import import { depthAwareDownsample } from 'three/addons/tsl/display/DepthAwareDownsampleNode.js';
 */
class DepthAwareDownsampleNode extends Node {

	static get type() {

		return 'DepthAwareDownsampleNode';

	}

	/**
	 * Constructs a new depth-aware downsample node.
	 *
	 * @param {TextureNode} depthNode - The scene's depth.
	 * @param {Object<string,TextureNode>} [textureNodes={}] - The texture nodes to downsample along with the depth.
	 * They must have the resolution of the scene's depth.
	 */
	constructor( depthNode, textureNodes = {} ) {

		super( 'vec4' );

		/**
		 * The scene's depth.
		 *
		 * @type {TextureNode}
		 */
		this.depthNode = depthNode;

		/**
		 * The texture nodes to downsample along with the depth.
		 *
		 * @type {Object<string,TextureNode>}
		 */
		this.textureNodes = textureNodes;

		/**
		 * The level to downsample to. `1` is half and `2` is quarter resolution.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.level = 1;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * The level as a uniform.
		 *
		 * @private
		 * @type {UniformNode<uint>}
		 */
		this._level = uniform( 1, 'uint' );

		/**
		 * The size of the scene's depth as a uniform.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._size = uniform( new Vector2() );

		const names = Object.keys( textureNodes );

		/**
		 * The render target the inputs are downsampled into. The first texture holds
		 * the nearest depth.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._renderTarget = new RenderTarget( 1, 1, { depthBuffer: false, count: names.length + 1 } );

		const depthTexture = this._renderTarget.textures[ 0 ];
		depthTexture.name = 'DepthAwareDownsample.depth';
		depthTexture.type = FloatType;
		depthTexture.format = RedFormat;
		depthTexture.minFilter = NearestFilter;
		depthTexture.magFilter = NearestFilter;

		/**
		 * The material that is used to render the effect.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._material = new NodeMaterial();
		this._material.name = 'DepthAwareDownsample';

		/**
		 * The downsampled inputs as texture nodes.
		 *
		 * @private
		 * @type {Object<string,PassTextureNode>}
		 */
		this._textureNodes = { depth: passTexture( this, depthTexture ) };

		for ( let i = 0; i < names.length; i ++ ) {

			const texture = this._renderTarget.textures[ i + 1 ];
			texture.name = 'DepthAwareDownsample.' + names[ i ];

			this._textureNodes[ names[ i ] ] = passTexture( this, texture );

		}

	}

	/**
	 * Returns a downsampled input as a texture node.
	 *
	 * @param {string} [name='depth'] - The name of the input. `depth` is the nearest depth and can be
	 * used like the scene's depth.
	 * @return {PassTextureNode} A texture node that represents the downsampled input.
	 */
	getTextureNode( name = 'depth' ) {

		return this._textureNodes[ name ];

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

		const { width, height } = this.depthNode.value.image;

		this._level.value = this.level;
		this._size.value.set( width, height );
		this._renderTarget.setSize( Math.max( 1, width >> this.level ), Math.max( 1, height >> this.level ) );

		_quadMesh.material = this._material;
		_quadMesh.name = 'Depth-Aware Downsample';

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

		// the scene's depth must be updated before this node

		builder.getNodeProperties( this ).depthNode = this.depthNode;

		// the downsampled inputs have the format of their sources

		const sources = Object.values( this.textureNodes );

		for ( let i = 0; i < sources.length; i ++ ) {

			const source = sources[ i ].value;
			const texture = this._renderTarget.textures[ i + 1 ];

			texture.format = source.format;
			texture.type = source.type;
			texture.minFilter = source.minFilter;
			texture.magFilter = source.magFilter;

		}

		const reversed = builder.renderer.reversedDepthBuffer;

		// the last cell of a level also covers the remaining row or column of an odd sized source

		const size = uvec2( this._size );
		const shift = uvec2( this._level );
		const cell = uvec2( screenCoordinate.xy );
		const last = size.shiftRight( shift ).max( uvec2( 1 ) ).sub( uvec2( 1 ) );
		const begin = cell.shiftLeft( shift ).toConst();
		const end = cell.equal( last ).select( size, begin.add( uvec2( 1 ).shiftLeft( shift ) ) ).toConst();

		// find the nearest depth of the cell and the texel that holds it

		const result = Fn( () => {

			const nearest = float( reversed ? 0 : 1 ).toVar();
			const coord = ivec2( begin ).toVar();

			Loop( { start: begin.y, end: end.y, type: 'uint', name: 'y' }, ( { y } ) => {

				Loop( { start: begin.x, end: end.x, type: 'uint', name: 'x' }, ( { x } ) => {

					const depth = textureLoad( this.depthNode, ivec2( x, y ) ).r.toVar();

					If( reversed ? depth.greaterThan( nearest ) : depth.lessThan( nearest ), () => {

						nearest.assign( depth );
						coord.assign( ivec2( x, y ) );

					} );

				} );

			} );

			return vec3( nearest, vec2( coord ) );

		} )().toConst();

		const coord = ivec2( result.yz );

		const textures = sources.map( ( node ) => textureLoad( node, coord ) );

		this._material.contextNode = context( builder.getSharedContext() );
		this._material.fragmentNode = outputStruct( vec4( result.x, 0, 0, 1 ), ...textures );
		this._material.needsUpdate = true;

		return this._textureNodes.depth;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		super.dispose();

		this._renderTarget.dispose();

		this._material.dispose();

	}

}

export default DepthAwareDownsampleNode;

/**
 * TSL function for creating a depth-aware downsample node.
 *
 * @tsl
 * @function
 * @param {TextureNode} depthNode - The scene's depth.
 * @param {Object<string,TextureNode>} [textureNodes={}] - The texture nodes to downsample along with the depth.
 * @returns {DepthAwareDownsampleNode}
 */
export const depthAwareDownsample = ( depthNode, textureNodes ) => new DepthAwareDownsampleNode( nodeObject( depthNode ), textureNodes );
