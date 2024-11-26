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

class RTTNode extends TextureNode {

	static get type() {

		return 'RTTNode';

	}

	constructor( node, width = null, height = null, options = { type: HalfFloatType } ) {

		const renderTarget = new RenderTarget( width, height, options );

		super( renderTarget.texture, uv() );

		this.node = node;
		this.width = width;
		this.height = height;

		this.renderTarget = renderTarget;

		this.textureNeedsUpdate = true;
		this.autoUpdate = true;

		this.updateMap = new WeakMap();

		this._rttNode = null;
		this._quadMesh = new QuadMesh( new NodeMaterial() );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	get autoSize() {

		return this.width === null;

	}

	setup( builder ) {

		this._rttNode = this.node.context( builder.getSharedContext() );
		this._quadMesh.material.name = 'RTT';
		this._quadMesh.material.needsUpdate = true;

		return super.setup( builder );

	}

	setSize( width, height ) {

		this.width = width;
		this.height = height;

		const effectiveWidth = width * this.pixelRatio;
		const effectiveHeight = height * this.pixelRatio;

		this.renderTarget.setSize( effectiveWidth, effectiveHeight );

		this.textureNeedsUpdate = true;

	}

	setPixelRatio( pixelRatio ) {

		this.pixelRatio = pixelRatio;

		this.setSize( this.width, this.height );

	}

	updateBefore( { renderer } ) {

		if ( this.textureNeedsUpdate === false && this.autoUpdate === false ) return;

		this.textureNeedsUpdate = false;

		//

		if ( this.autoSize === true ) {

			this.pixelRatio = renderer.getPixelRatio();

			const size = renderer.getSize( _size );

			this.setSize( size.width, size.height );

		}

		//

		this._quadMesh.material.fragmentNode = this._rttNode;

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

export const rtt = ( node, ...params ) => nodeObject( new RTTNode( nodeObject( node ), ...params ) );

export const convertToTexture = ( node, ...params ) => {

	if ( node.isTextureNode ) return node;
	if ( node.isPassNode ) return node.getTextureNode();

	return rtt( node, ...params );

};
