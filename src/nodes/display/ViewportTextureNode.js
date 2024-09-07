import TextureNode from '../accessors/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { screenUV } from './ScreenNode.js';

import { Vector2 } from '../../math/Vector2.js';
import { FramebufferTexture } from '../../textures/FramebufferTexture.js';
import { LinearMipmapLinearFilter } from '../../constants.js';

const _size = /*@__PURE__*/ new Vector2();

class ViewportTextureNode extends TextureNode {

	static get type() {

		return 'ViewportTextureNode';

	}

	constructor( uvNode = screenUV, levelNode = null, framebufferTexture = null ) {

		if ( framebufferTexture === null ) {

			framebufferTexture = new FramebufferTexture();
			framebufferTexture.minFilter = LinearMipmapLinearFilter;

		}

		super( framebufferTexture, uvNode, levelNode );

		this.generateMipmaps = false;

		this.isOutputTextureNode = true;

		this.updateBeforeType = NodeUpdateType.FRAME;

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

		const currentGenerateMipmaps = framebufferTexture.generateMipmaps;
		framebufferTexture.generateMipmaps = this.generateMipmaps;

		renderer.copyFramebufferToTexture( framebufferTexture );

		framebufferTexture.generateMipmaps = currentGenerateMipmaps;

	}

	clone() {

		const viewportTextureNode = new this.constructor( this.uvNode, this.levelNode, this.value );
		viewportTextureNode.generateMipmaps = this.generateMipmaps;

		return viewportTextureNode;

	}

}

export default ViewportTextureNode;

export const viewportTexture = /*@__PURE__*/ nodeProxy( ViewportTextureNode );
export const viewportMipTexture = /*@__PURE__*/ nodeProxy( ViewportTextureNode, null, null, { generateMipmaps: true } );
