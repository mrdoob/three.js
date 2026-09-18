import AngularGaussianBlurNode from '../../../nodes/utils/AngularGaussianBlurNode.js';
import { NodeUpdateType } from '../../../nodes/core/constants.js';
import { nodeObject } from '../../../nodes/tsl/TSLBase.js';
import CubemapBlurGenerator from '../extras/CubemapBlurGenerator.js';

const _cache = new WeakMap();

/**
 * Returns the per-renderer generator and cache of blurred cube maps. Render target
 * textures can't be shared across render contexts.
 *
 * @private
 * @param {Renderer} renderer - The renderer.
 * @return {{generator: CubemapBlurGenerator, entries: WeakMap<BackgroundBlurNode, Object>}} The cache.
 */
function _getCache( renderer ) {

	let rendererCache = _cache.get( renderer );

	if ( rendererCache === undefined ) {

		rendererCache = { generator: new CubemapBlurGenerator( renderer ), entries: new WeakMap() };
		_cache.set( renderer, rendererCache );

	}

	return rendererCache;

}

/**
 * Returns the cached blur, updating it when the source or amount changes.
 *
 * @private
 * @param {BackgroundBlurNode} node - The node owning the blurred result.
 * @param {Renderer} renderer - The renderer.
 * @return {?CubeRenderTarget} The render target holding the blurred cube map or `null` if the texture is not ready yet.
 */
function _getBlurredCubemap( node, renderer ) {

	const { textureNode, amount } = node;
	const texture = textureNode.value;
	const { generator, entries } = _getCache( renderer );

	// Cache by node to keep blur amounts independent.
	let entry = entries.get( node );

	if ( entry === undefined || entry.texture !== texture || entry.amount !== amount || entry.pmremVersion !== texture.pmremVersion ) {

		const image = texture.image;
		const ready = texture.isCubeTexture ? ( image.length === 6 && ! image.includes( undefined ) ) : ( image && image.height > 0 );

		if ( ! ready ) return null;

		if ( entry === undefined ) {

			entry = { texture: null, renderTarget: null };
			entries.set( node, entry );

			entry.dispose = () => {

				if ( entry.texture !== null ) entry.texture.removeEventListener( 'dispose', entry.dispose );
				if ( entry.renderTarget !== null ) entry.renderTarget.dispose();

				entry.texture = null;
				entry.renderTarget = null;

			};

			const onDispose = ( event ) => {

				entry.dispose();
				event.target.removeEventListener( 'dispose', onDispose );
				entries.delete( event.target );

			};

			node.addEventListener( 'dispose', onDispose );

		}

		if ( entry.texture !== texture ) {

			if ( entry.texture !== null ) entry.texture.removeEventListener( 'dispose', entry.dispose );

			entry.texture = texture;
			texture.addEventListener( 'dispose', entry.dispose );

		}

		entry.renderTarget = generator.fromTexture( texture, amount, entry.renderTarget );
		entry.amount = amount;
		entry.pmremVersion = texture.pmremVersion;

	}

	return entry.renderTarget;

}

/**
 * Caches the angular Gaussian blur used by scene backgrounds.
 *
 * @private
 * @augments AngularGaussianBlurNode
 */
class BackgroundBlurNode extends AngularGaussianBlurNode {

	static get type() {

		return 'BackgroundBlurNode';

	}

	constructor( textureNode ) {

		super( textureNode );

		this.isBackgroundBlurNode = true;
		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore( frame ) {

		const renderTarget = _getBlurredCubemap( this, frame.renderer );

		if ( renderTarget !== null ) this._cubeTextureNode.value = renderTarget.texture;

	}

	setup( builder ) {

		this.updateBefore( builder );

		return this._setupOutput( builder );

	}

}

export const backgroundBlur = ( textureNode ) => nodeObject( new BackgroundBlurNode( textureNode ) );
