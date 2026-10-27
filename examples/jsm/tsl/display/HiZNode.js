import { FloatType, NearestFilter, Node, NodeUpdateType, RGFormat, StorageTexture, Vector4 } from 'three/webgpu';
import { Fn, Loop, ivec2, max, min, nodeObject, passTexture, textureLoad, textureStore, uint, uniform, uniformArray, uv, vec2, vec4, texture, invocationLocalIndex, workgroupId, workgroupArray, workgroupBarrier, If } from 'three/tsl';

const WORKGROUP_SIZE = 64;
const MAX_LEVELS = 16;

/**
 * Builds a farthest-depth hierarchy with successive WebGPU reductions.
 *
 * Levels are stored vertically in an RG32F atlas, with floor-halved dimensions.
 * The last cell includes the odd trailing row/column (a 3x2, 2x3 or 3x3
 * reduction). Standard depth uses max; reversed depth uses min. Values remain
 * raw device depth, not linearized depth.
 * The red channel stores farthest depth and green stores nearest depth, allowing
 * consumers to conservatively reject intervals in front of every surface.
 *
 * Each dispatch reduces up to three levels using workgroup memory. Dispatch
 * boundaries provide portable synchronization; source reads scale linearly with the input pixel count.
 * Separate intermediate textures avoid sampling the atlas while writing to it.
 * The atlas height is less than twice the input height and must fit the
 * device's maximum 2D texture dimension.
 *
 * ```js
 * const pyramid = hiZ( scenePass.getTextureNode( 'depth' ) );
 * pyramid.level.value = 3;
 * renderPipeline.outputNode = vec4( vec3( pyramid ), 1 );
 * ```
 *
 * @augments Node
 * @three_import import { hiZ } from 'three/addons/tsl/display/HiZNode.js';
 */
class HiZNode extends Node {

	static get type() {

		return 'HiZNode';

	}

	/**
	 * @param {TextureNode} depthNode - A full-resolution, raw depth texture node.
	 * @param {Object} [options] - Options.
	 * @param {boolean} [options.reversedDepth] - Override the renderer's depth convention (useful for synthetic depth textures).
	 */
	constructor( depthNode, { reversedDepth } = {} ) {

		super( 'float' );

		if ( depthNode.isTextureNode !== true ) throw new Error( 'HiZNode: A raw depth TextureNode is required.' );

		this.depthNode = depthNode;
		this.reversedDepth = reversedDepth;
		/** Whether to rebuild the atlas each frame. Disabling retains its last contents. @type {boolean} */
		this.enabled = true;
		/** Selected debug level. Clamped to the available hierarchy. @type {UniformNode<uint>} */
		this.level = uniform( 0, 'uint' );
		this.updateBeforeType = NodeUpdateType.FRAME;

		this.texture = new StorageTexture();
		this.texture.name = 'HiZNode.Atlas';
		this.texture.type = FloatType;
		this.texture.format = RGFormat;
		this.texture.minFilter = NearestFilter;
		this.texture.magFilter = NearestFilter;
		this.texture.generateMipmaps = false;

		/** @type {Array<{width:number,height:number,offset:number}>} */
		this.levels = [];
		this._layout = uniformArray( Array.from( { length: MAX_LEVELS }, () => new Vector4( 1, 1, 0, 1 ) ) );
		this._lastLevel = uniform( 0, 'uint' );
		this._textureNode = passTexture( this, this.texture );
		this._computeNode = null;
		this._levelTextures = [];
		this._width = 0;
		this._height = 0;
		this._reversed = null;

	}

	/**
	 * Samples a hierarchy level using nearest texels, clamped within that level.
	 * Level zero is the original depth. Out-of-range levels clamp to the last.
	 *
	 * @param {Node<uint>|number} [level=this.level] - Hierarchy level.
	 * @param {Node<vec2>} [uvNode=uv()] - Normalized coordinates.
	 * @return {Node<float>} Raw farthest depth.
	 */
	getTextureNode( level = this.level, uvNode = uv() ) {

		return this.getDepthRangeNode( level, uvNode ).r;

	}

	/**
	 * @param {Node<uint>|number} level - Hierarchy level.
	 * @param {Node<vec2>} uvNode - Original-image normalized coordinates.
	 * @return {Node<float>} Raw nearest depth.
	 */
	getNearestDepthNode( level, uvNode ) {

		return this.getDepthRangeNode( level, uvNode ).g;

	}

	/**
	 * @param {Node<uint>|number} level - Hierarchy level.
	 * @param {Node<vec2>} uvNode - Original-image normalized coordinates.
	 * @return {Node<vec2>} Raw (farthest, nearest) depth.
	 */
	getDepthRangeNode( level, uvNode ) {

		const layout = this._layout.element( uint( level ).min( this._lastLevel ) );
		// Map original-image UVs to the exact reduction footprint. Scaling by
		// level dimensions instead would shift cell boundaries at odd sizes.
		const size = this._layout.element( uint( 0 ) ).xy;
		const coord = ivec2( uvNode.mul( size ).div( layout.w ).floor().clamp( 0, layout.xy.sub( 1 ) ) );
		return textureLoad( this._textureNode, coord.add( ivec2( 0, layout.z ) ) ).rg;

	}

	/** @return {Node<uint>} Last available hierarchy level. */
	getLastLevelNode() {

		return this._lastLevel;

	}

	/**
	 * Exact normalized cell bounds (minX, minY, maxX, maxY), including odd edges.
	 * @param {Node<uint>|number} level - Hierarchy level.
	 * @param {Node<vec2>} uvNode - Original-image normalized coordinates.
	 * @return {Node<vec4>} Cell rectangle.
	 */
	getCellBoundsNode( level, uvNode ) {

		const layout = this._layout.element( uint( level ).min( this._lastLevel ) );
		const size = this._layout.element( uint( 0 ) ).xy;
		const cell = uvNode.mul( size ).div( layout.w ).floor().clamp( 0, layout.xy.sub( 1 ) );
		const begin = cell.mul( layout.w );
		const end = vec2(
			cell.x.equal( layout.x.sub( 1 ) ).select( size.x, begin.x.add( layout.w ) ),
			cell.y.equal( layout.y.sub( 1 ) ).select( size.y, begin.y.add( layout.w ) )
		);
		return vec4( begin.div( size ), end.div( size ) );

	}

	/**
	 * Updates the hierarchy layout. Called automatically from the input size.
	 *
	 * @param {number} width - Input width in pixels.
	 * @param {number} height - Input height in pixels.
	 */
	setSize( width, height ) {

		if ( ! Number.isInteger( width ) || ! Number.isInteger( height ) || width < 1 || height < 1 ) {

			throw new Error( 'HiZNode: Depth dimensions must be positive integers.' );

		}

		if ( width === this._width && height === this._height ) return;

		this._width = width;
		this._height = height;
		this.levels = [];
		let offset = 0;

		while ( true ) {

			this.levels.push( { width, height, offset } );
			offset += height;
			if ( width === 1 && height === 1 ) break;
			width = Math.max( 1, Math.floor( width / 2 ) );
			height = Math.max( 1, Math.floor( height / 2 ) );

		}

		if ( this.levels.length > MAX_LEVELS ) throw new Error( 'HiZNode: Too many hierarchy levels.' );

		for ( let i = 0; i < MAX_LEVELS; i ++ ) {

			const entry = this.levels[ Math.min( i, this.levels.length - 1 ) ];
			this._layout.array[ i ].set( entry.width, entry.height, entry.offset, 2 ** Math.min( i, this.levels.length - 1 ) );

		}

		this._lastLevel.value = this.levels.length - 1;
		this.texture.setSize( this._width, offset );
		this._disposeCompute();

	}

	/** @private */
	_disposeCompute() {

		if ( this._computeNode !== null ) for ( const node of this._computeNode ) node.dispose();
		for ( const level of this._levelTextures ) level.dispose();
		this._computeNode = null;
		this._levelTextures = [];

	}

	/** @private */
	_buildCompute() {

		const reversed = this._reversed;
		const reduce = ( a, b ) => vec2( reversed ? min( a.x, b.x ) : max( a.x, b.x ), reversed ? max( a.y, b.y ) : min( a.y, b.y ) );
		this._computeNode = [];

		// Three local reductions share workgroup memory. Dispatch boundaries
		// synchronize successive tiles; no cross-workgroup spin waits or atomics
		// are needed. Odd trailing footprints retain the original floor layout.
		let source = this.depthNode;
		if ( this.levels.length === 1 ) {

			this._computeNode.push( Fn( () => {

				const depth = textureLoad( source, ivec2( 0 ) ).r;
				textureStore( this.texture, ivec2( 0 ), vec4( depth, depth, 0, 1 ) ).toWriteOnly();

			} )().compute( 1, [ WORKGROUP_SIZE ] ).setName( 'Hi-Z [ 1x1 ]' ) );
			return;

		}

		for ( let first = 1; first < this.levels.length; first += 3 ) {

			const last = Math.min( first + 2, this.levels.length - 1 );
			const parent = this.levels[ last ];
			const input = source;
			let target = null;
			if ( last < this.levels.length - 1 ) {

				target = new StorageTexture( parent.width, parent.height );
				target.type = FloatType;
				target.format = RGFormat;
				target.minFilter = target.magFilter = NearestFilter;
				target.generateMipmaps = false;
				this._levelTextures.push( target );
				source = texture( target );

			}

			const shared = Array.from( { length: last - first + 1 }, ( _, i ) => workgroupArray( 'vec2', ( 8 >> i ) ** 2 ) );
			const compute = Fn( () => {

				const groupX = workgroupId.x.toVar();
				const groupY = workgroupId.y.toVar();
				for ( let level = first; level <= last; level ++ ) {

					const stage = level - first;
					const pitch = 8 >> stage;
					const entry = this.levels[ level ];
					const previous = this.levels[ level - 1 ];
					const span = 2 ** ( last - level );
					const base = ivec2( groupX, groupY ).mul( span ).toVar();
					const x = uint( base.x ).add( invocationLocalIndex.mod( pitch ) ).toVar();
					const y = uint( base.y ).add( invocationLocalIndex.div( pitch ) ).toVar();
					const endX = groupX.equal( parent.width - 1 ).select( uint( entry.width ), uint( base.x ).add( span ) );
					const endY = groupY.equal( parent.height - 1 ).select( uint( entry.height ), uint( base.y ).add( span ) );
					If( invocationLocalIndex.lessThan( pitch * pitch ).and( x.lessThan( endX ) ).and( y.lessThan( endY ) ), () => {

						const value = vec2( reversed ? 1 : 0, reversed ? 0 : 1 ).toVar();
						const sampleEndX = x.equal( entry.width - 1 ).select( uint( previous.width ), x.mul( 2 ).add( 2 ) );
						const sampleEndY = y.equal( entry.height - 1 ).select( uint( previous.height ), y.mul( 2 ).add( 2 ) );
						Loop( { start: y.mul( 2 ), end: sampleEndY, type: 'uint', name: 'sy' + stage }, ( indices ) => {

							const sy = indices[ 'sy' + stage ];
							Loop( { start: x.mul( 2 ), end: sampleEndX, type: 'uint', name: 'sx' + stage }, ( indices ) => {

								const sx = indices[ 'sx' + stage ];
								let range;
								if ( stage === 0 ) {

									const sample = textureLoad( input, ivec2( sx, sy ) );
									range = level === 1 ? vec2( sample.r ) : sample.rg;
									if ( level === 1 ) textureStore( this.texture, ivec2( sx, sy ), vec4( range, 0, 1 ) ).toWriteOnly();

								} else {

									const local = ivec2( sx, sy ).sub( base.mul( 2 ) );
									range = shared[ stage - 1 ].element( local.y.mul( pitch * 2 ).add( local.x ) );

								}

								value.assign( reduce( value, range ) );

							} );

						} );
						shared[ stage ].element( invocationLocalIndex ).assign( value );
						textureStore( this.texture, ivec2( x, y.add( entry.offset ) ), vec4( value, 0, 1 ) ).toWriteOnly();
						if ( level === last && target !== null ) textureStore( target, ivec2( x, y ), vec4( value, 0, 1 ) ).toWriteOnly();

					} );
					if ( level !== last ) workgroupBarrier();

				}

			} )().compute( [ parent.width, parent.height, 1 ], [ WORKGROUP_SIZE ] ).setName( 'Hi-Z [ Levels ' + first + '-' + last + ' ]' );
			this._computeNode.push( compute );

		}

	}

	/**
	 * @param {NodeFrame} frame - Frame state.
	 */
	updateBefore( { renderer } ) {

		if ( this.enabled === false ) return;
		if ( renderer.backend.isWebGPUBackend !== true ) throw new Error( 'HiZNode: A WebGPU backend is required.' );

		const image = this.depthNode.value.image;
		this.setSize( image.width, image.height );
		const limit = renderer.backend.device.limits.maxTextureDimension2D;
		if ( this.texture.image.width > limit || this.texture.image.height > limit ) throw new Error( 'HiZNode: Depth atlas exceeds maxTextureDimension2D.' );

		const reversed = this.reversedDepth ?? renderer.reversedDepthBuffer;
		if ( reversed !== this._reversed ) {

			this._reversed = reversed;
			this._disposeCompute();

		}

		if ( this._computeNode === null ) this._buildCompute();
		renderer.compute( this._computeNode );

	}

	/**
	 * @param {NodeBuilder} builder - Node builder.
	 * @return {Node<float>} Selected level.
	 */
	setup( builder ) {

		// Make the producing pass a dependency of this node, before dispatch.
		builder.getNodeProperties( this ).depthNode = this.depthNode;
		return this.getTextureNode();

	}

	/** Frees the atlas and compute pipeline. */
	dispose() {

		super.dispose();
		this._disposeCompute();
		this.texture.dispose();

	}

}

export default HiZNode;

/**
 * Creates a farthest-depth pyramid. Requires a hardware WebGPU backend.
 *
 * @tsl
 * @function
 * @param {TextureNode} depthNode - Raw depth texture.
 * @param {Object} [options] - Depth convention override.
 * @return {HiZNode} The depth hierarchy node.
 */
export const hiZ = ( depthNode, options ) => new HiZNode( nodeObject( depthNode ), options );
