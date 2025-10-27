import { nodeObject } from '../tsl/TSLCore.js';
import TextureNode from '../accessors/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uv } from '../accessors/UV.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';

import { RenderTarget } from '../../core/RenderTarget.js';
import { Vector2 } from '../../math/Vector2.js';
import { HalfFloatType } from '../../constants.js';

const _size = /*@__PURE__*/ new Vector2();

/**
 * `RTTNode` takes another node and uses it with a `QuadMesh` to render into a texture (RTT).
 * This module is especially relevant in context of post processing where certain nodes require
 * texture input for their effects. With the helper function `convertToTexture()` which is based
 * on this module, the node system can automatically ensure texture input if required.
 *
 * @augments TextureNode
 */
class RTTNode extends TextureNode {

	static get type() {

		return 'RTTNode';

	}

	/**
	 * Constructs a new RTT node.
	 *
	 * @param {Node} node - The node to render a texture with.
	 * @param {?number} [width=null] - The width of the internal render target. If not width is applied, the render target is automatically resized.
	 * @param {?number} [height=null] - The height of the internal render target.
	 * @param {Object} [options={type:HalfFloatType}] - The options for the internal render target.
	 */
	constructor( node, width = null, height = null, options = { type: HalfFloatType } ) {

		const renderTarget = new RenderTarget( width, height, options );

		super( renderTarget.texture, uv() );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isRTTNode = true;

		/**
		 * The node to render a texture with.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The width of the internal render target.
		 * If not width is applied, the render target is automatically resized.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.width = width;

		/**
		 * The height of the internal render target.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.height = height;

		/**
		 * The pixel ratio
		 *
		 * @type {number}
		 * @default 1
		 */
		this.pixelRatio = 1;

		/**
		 * The render target
		 *
		 * @type {RenderTarget}
		 */
		this.renderTarget = renderTarget;

		/**
		 * Whether the texture requires an update or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.textureNeedsUpdate = true;

		/**
		 * Whether the texture should automatically be updated or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoUpdate = true;

		/**
		 * The node which is used with the quad mesh for RTT.
		 *
		 * @private
		 * @type {Node}
		 * @default null
		 */
		this._rttNode = null;

		/**
		 * The internal quad mesh for RTT.
		 *
		 * @private
		 * @type {QuadMesh}
		 */
		this._quadMesh = new QuadMesh( new NodeMaterial() );

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.RENDER` since the node updates
		 * the texture once per render in its {@link RTTNode#updateBefore} method.
		 *
		 * @type {string}
		 * @default 'render'
		 */
		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	/**
	 * Whether the internal render target should automatically be resized or not.
	 *
	 * @type {boolean}
	 * @readonly
	 * @default true
	 */
	get autoResize() {

		return this.width === null;

	}

	setup( builder ) {

		this._rttNode = this.node.context( builder.getSharedContext() );
		this._quadMesh.material.name = 'RTT';
		this._quadMesh.material.needsUpdate = true;

		return super.setup( builder );

	}

	/**
	 * Sets the size of the internal render target
	 *
	 * @param {number} width - The width to set.
	 * @param {number} height - The width to set.
	 */
	setSize( width, height ) {

		this.width = width;
		this.height = height;

		const effectiveWidth = width * this.pixelRatio;
		const effectiveHeight = height * this.pixelRatio;

		this.renderTarget.setSize( effectiveWidth, effectiveHeight );

		this.textureNeedsUpdate = true;

	}

	/**
	 * Sets the pixel ratio. This will also resize the render target.
	 *
	 * @param {number} pixelRatio - The pixel ratio to set.
	 */
	setPixelRatio( pixelRatio ) {

		this.pixelRatio = pixelRatio;

		this.setSize( this.width, this.height );

	}

	updateBefore( { renderer } ) {

		if ( this.textureNeedsUpdate === false && this.autoUpdate === false ) return;

		this.textureNeedsUpdate = false;

		//

		if ( this.autoResize === true ) {

			const pixelRatio = renderer.getPixelRatio();
			const size = renderer.getSize( _size );

			const effectiveWidth = Math.floor( size.width * pixelRatio );
			const effectiveHeight = Math.floor( size.height * pixelRatio );

			if ( effectiveWidth !== this.renderTarget.width || effectiveHeight !== this.renderTarget.height ) {

				this.renderTarget.setSize( effectiveWidth, effectiveHeight );

				this.textureNeedsUpdate = true;

			}

		}

		//

		let name = 'RTT';

		if ( this.node.name ) {

			name = this.node.name + ' [ ' + name + ' ]';

		}


		this._quadMesh.material.fragmentNode = this._rttNode;
		this._quadMesh.name = name;

		//

		const currentRenderTarget = renderer.getRenderTarget();

		renderer.setRenderTarget( this.renderTarget );

		this._quadMesh.render( renderer );

		renderer.setRenderTarget( currentRenderTarget );

	}

	clone() {

		const newNode = new TextureNode( this.value, this.uvNode, this.levelNode );
		newNode.sampler = this.sampler;
		newNode.referenceNode = this;

		return newNode;

	}

}

export default RTTNode;

/**
 * TSL function for creating a RTT node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node to render a texture with.
 * @param {?number} [width=null] - The width of the internal render target. If not width is applied, the render target is automatically resized.
 * @param {?number} [height=null] - The height of the internal render target.
 * @param {Object} [options={type:HalfFloatType}] - The options for the internal render target.
 * @returns {RTTNode}
 */
export const rtt = ( node, ...params ) => nodeObject( new RTTNode( nodeObject( node ), ...params ) );

/**
 * TSL function for converting nodes to textures nodes.
 *
 * @tsl
 * @function
 * @param {Node} node - The node to render a texture with.
 * @param {?number} [width=null] - The width of the internal render target. If not width is applied, the render target is automatically resized.
 * @param {?number} [height=null] - The height of the internal render target.
 * @param {Object} [options={type:HalfFloatType}] - The options for the internal render target.
 * @returns {RTTNode}
 */
export const convertToTexture = ( node, ...params ) => {

	if ( node.isSampleNode || node.isTextureNode ) return node;
	if ( node.isPassNode ) return node.getTextureNode();

	return rtt( node, ...params );

};
