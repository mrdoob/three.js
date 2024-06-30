import { nodeObject, addNodeElement } from '../shadernode/ShaderNode.js';
import TextureNode from '../accessors/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { addNodeClass } from '../core/Node.js';
import NodeMaterial from '../materials/NodeMaterial.js';
import { uv } from '../accessors/UVNode.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';

import { RenderTarget } from '../../core/RenderTarget.js';
import { Vector2 } from '../../math/Vector2.js';
import { HalfFloatType } from '../../constants.js';

const _quadMesh = new QuadMesh( new NodeMaterial() );
const _size = new Vector2();

class RTTNode extends TextureNode {

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

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	get autoSize() {

		return this.width === null;

	}

	setSize( width, height ) {

		this.width = width;
		this.height = height;

		this.renderTarget.setSize( width, height );

		this.textureNeedsUpdate = true;

	}

	updateBefore( { renderer } ) {

		if ( this.textureNeedsUpdate === false && this.autoUpdate === false ) return;

		this.textureNeedsUpdate = false;

		//

		if ( this.autoSize === true ) {

			const size = renderer.getSize( _size );

			this.setSize( size.width, size.height );

		}

		//

		_quadMesh.material.fragmentNode = this.node;

		//

		const currentRenderTarget = renderer.getRenderTarget();

		renderer.setRenderTarget( this.renderTarget );

		_quadMesh.render( renderer );

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

addNodeElement( 'toTexture', ( node, ...params ) => node.isTextureNode ? node : rtt( node, ...params ) );

addNodeClass( 'RTTNode', RTTNode );
