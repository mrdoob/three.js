import TextureNode from '../accessors/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { viewportTopLeft } from './ViewportNode.js';
import { Vector2 } from 'three';

let size = new Vector2();

class ViewportTextureNode extends TextureNode {

	constructor( uv = viewportTopLeft, level = null ) {

		super( null, uv, level );

		this.rtt = null;

		this.isOutputTextureNode = true;

		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	constructRTT( builder ) {

		return builder.getRenderTarget();

	}

	construct( builder ) {

		if ( this.rtt === null ) this.rtt = this.constructRTT( builder );

		this.value = this.rtt.texture;

		return super.construct( builder );

	}

	updateBefore( frame ) {

		const rtt = this.rtt;

		const renderer = frame.renderer;
		renderer.getDrawingBufferSize( size );

		rtt.setSize( size.width, size.height );

		renderer.copyFramebufferToRenderTarget( rtt );

	}

}

export default ViewportTextureNode;

export const viewportTexture = nodeProxy( ViewportTextureNode );

addNodeElement( 'viewportTexture', viewportTexture );

addNodeClass( ViewportTextureNode );
