import TextureNode from '../accessors/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { viewportTopLeft } from './ViewportNode.js';
import { Vector2, FramebufferTexture } from 'three';

const _size = new Vector2();

class ViewportTextureNode extends TextureNode {

	constructor( uv = viewportTopLeft, level = null ) {

		super( null, uv, level );

		this.isOutputTextureNode = true;

		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	constructFramebuffer( /*builder*/ ) {

		return new FramebufferTexture();

	}

	construct( builder ) {

		if ( this.value === null ) this.value = this.constructFramebuffer( builder );

		return super.construct( builder );

	}

	updateBefore( frame ) {

		const renderer = frame.renderer;
		renderer.getDrawingBufferSize( _size );

		//

		const framebufferTexture = this.value;

		if ( framebufferTexture.image.width !== _size.width || framebufferTexture.image.height !== _size.height ) {

			framebufferTexture.image.width = _size.width;
			framebufferTexture.image.height = _size.height;
			framebufferTexture.needsUpdate = true;

		}

		//

		renderer.copyFramebufferToTexture( framebufferTexture );

	}

}

export default ViewportTextureNode;

export const viewportTexture = nodeProxy( ViewportTextureNode );

addNodeElement( 'viewportTexture', viewportTexture );

addNodeClass( ViewportTextureNode );
