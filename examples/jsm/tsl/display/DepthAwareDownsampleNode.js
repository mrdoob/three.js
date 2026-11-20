import { FloatType, NearestFilter, Node, NodeMaterial, NodeUpdateType, QuadMesh, RendererUtils, RenderTarget, RGFormat } from 'three/webgpu';
import { Fn, If, Loop, context, ivec2, nodeObject, outputStruct, passTexture, screenCoordinate, textureLoad, uint, uniform, uvec2, vec2, vec4 } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState;

/**
 * Downsamples the scene's depth and further screen-space inputs like normals for effects
 * that are computed in a reduced resolution.
 *
 * Each texel holds the nearest depth of the texels it covers, read from the given depth
 * hierarchy, and all other inputs are taken from the texel holding that depth. The inputs
 * of an effect are thus consistent and the effect itself doesn't have to know about the
 * reduced resolution.
 *
 * ```js
 * const depthHierarchy = hiZ( scenePassDepth, { maxLevel: 1 } );
 * const downsample = depthAwareDownsample( depthHierarchy, { normal: scenePassNormal } );
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
	 * @param {HiZNode} hiZNode - The depth hierarchy of the scene's depth.
	 * @param {Object<string,TextureNode>} [textureNodes={}] - The texture nodes to downsample along with the depth.
	 * They must have the resolution of the scene's depth.
	 */
	constructor( hiZNode, textureNodes = {} ) {

		super( 'vec4' );

		/**
		 * The depth hierarchy of the scene's depth.
		 *
		 * @type {HiZNode}
		 */
		this.hiZNode = hiZNode;

		/**
		 * The texture nodes to downsample along with the depth.
		 *
		 * @type {Object<string,TextureNode>}
		 */
		this.textureNodes = textureNodes;

		/**
		 * The level of the depth hierarchy to downsample to. `1` is half and `2` is
		 * quarter resolution. Must not exceed the last level of the depth hierarchy.
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

		const names = Object.keys( textureNodes );

		/**
		 * The render target the inputs are downsampled into. The first texture holds
		 * the nearest and farthest depth in its red and green channel.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._renderTarget = new RenderTarget( 1, 1, { depthBuffer: false, count: names.length + 1 } );

		const depthTexture = this._renderTarget.textures[ 0 ];
		depthTexture.name = 'DepthAwareDownsample.depth';
		depthTexture.type = FloatType;
		depthTexture.format = RGFormat;
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
	 * @param {string} [name='depth'] - The name of the input. The red channel of `depth` is the nearest
	 * depth so it can be used like the scene's depth, the green channel is the farthest depth.
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

		const { width, height } = this.hiZNode.levels[ this.level ];

		this._level.value = this.level;
		this._renderTarget.setSize( width, height );

		const names = Object.keys( this.textureNodes );

		for ( let i = 0; i < names.length; i ++ ) {

			const source = this.textureNodes[ names[ i ] ].value;
			const texture = this._renderTarget.textures[ i + 1 ];

			texture.format = source.format;
			texture.type = source.type;
			texture.minFilter = source.minFilter;
			texture.magFilter = source.magFilter;

		}

		//

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

		// the depth hierarchy must be updated before this node

		builder.getNodeProperties( this ).hiZNode = this.hiZNode;

		const begin = uvec2( screenCoordinate.xy ).shiftLeft( uvec2( this._level ) );
		const cell = this.hiZNode.getPixelCellNode( this._level, vec2( begin ) );

		// find the texel of the cell that holds the nearest depth

		const coord = Fn( () => {

			const coord = ivec2( begin ).toVar();

			Loop( { start: begin.y, end: uint( cell.end.y ), type: 'uint', name: 'y' }, ( { y } ) => {

				Loop( { start: begin.x, end: uint( cell.end.x ), type: 'uint', name: 'x' }, ( { x } ) => {

					If( textureLoad( this.hiZNode.depthNode, ivec2( x, y ) ).r.equal( cell.depth ), () => {

						coord.assign( ivec2( x, y ) );

					} );

				} );

			} );

			return coord;

		} )();

		const textures = Object.values( this.textureNodes ).map( ( node ) => textureLoad( node, coord ) );

		this._material.contextNode = context( builder.getSharedContext() );
		this._material.fragmentNode = outputStruct( vec4( cell.depth, cell.farthest, 0, 1 ), ...textures );
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
 * @param {HiZNode} hiZNode - The depth hierarchy of the scene's depth.
 * @param {Object<string,TextureNode>} [textureNodes={}] - The texture nodes to downsample along with the depth.
 * @returns {DepthAwareDownsampleNode}
 */
export const depthAwareDownsample = ( hiZNode, textureNodes ) => new DepthAwareDownsampleNode( nodeObject( hiZNode ), textureNodes );
