import TempNode from '../../../nodes/core/TempNode.js';
import { cubeTexture } from '../../../nodes/accessors/CubeTextureNode.js';
import { positionWorldDirection } from '../../../nodes/accessors/Position.js';
import { cubeTextureBicubic } from '../../../nodes/utils/CubeTextureBicubic.js';
import { NodeUpdateType } from '../../../nodes/core/constants.js';
import { nodeObject } from '../../../nodes/tsl/TSLBase.js';
import { CubeTexture } from '../../../textures/CubeTexture.js';
import PMREMGenerator from '../extras/PMREMGenerator.js';

const _cache = new WeakMap();

/**
 * Returns the per-renderer generator and cache of blurred cube maps. Render target
 * textures can't be shared across render contexts.
 *
 * @private
 * @param {Renderer} renderer - The renderer.
 * @return {{generator: PMREMGenerator, entries: WeakMap<BackgroundBlurNode, Object>}} The cache.
 */
function _getCache( renderer ) {

	let rendererCache = _cache.get( renderer );

	if ( rendererCache === undefined ) {

		rendererCache = { generator: new PMREMGenerator( renderer ), entries: new WeakMap() };
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

	const { sourceTexture: texture, amount } = node;
	const { generator, entries } = _getCache( renderer );

	// Cache by node to keep blur amounts independent.
	let entry = entries.get( node );

	if ( entry === undefined || entry.texture !== texture || entry.amount !== amount || entry.pmremVersion !== texture.pmremVersion ) {

		const image = texture.image;
		const ready = image && ( texture.isCubeTexture ? ( image.length === 6 && ! image.includes( undefined ) ) : image.height > 0 );

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

		const t = amount * 9 - 1;
		const sigma = ( t < 0 ? Math.max( t + 1, 0 ) : Math.pow( 2, t ) ) / 64;

		entry.renderTarget = generator._fromTextureBlur( texture, sigma, entry.renderTarget );
		entry.amount = amount;
		entry.pmremVersion = texture.pmremVersion;

	}

	return entry.renderTarget;

}

/**
 * Caches the angular Gaussian blur used by scene backgrounds.
 *
 * @private
 * @augments TempNode
 */
class BackgroundBlurNode extends TempNode {

	static get type() {

		return 'BackgroundBlurNode';

	}

	constructor( sourceTexture ) {

		super( 'vec3' );

		const image = { width: 1, height: 1 };
		const texture = new CubeTexture( [ image, image, image, image, image, image ] );
		texture.isRenderTargetTexture = true;

		this._cubeTextureNode = cubeTexture( texture, null, 0 );

		this.sourceTexture = sourceTexture;
		this.amount = 0;
		this.isBackgroundBlurNode = true;
		this.updateBeforeType = NodeUpdateType.RENDER;
		this._defaultTexture = texture;

	}

	updateBefore( frame ) {

		const renderTarget = _getBlurredCubemap( this, frame.renderer );

		this._cubeTextureNode.value = renderTarget !== null ? renderTarget.texture : this._defaultTexture;

	}

	setup( builder ) {

		this.updateBefore( builder );

		const uvNode = builder.context.getUV ? builder.context.getUV( this._cubeTextureNode, builder ) : positionWorldDirection;

		return cubeTextureBicubic( this._cubeTextureNode, uvNode );

	}

	dispose() {

		this._defaultTexture.dispose();
		super.dispose();

	}

}

export const backgroundBlur = ( texture ) => nodeObject( new BackgroundBlurNode( texture ) );
