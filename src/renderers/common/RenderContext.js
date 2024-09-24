import { Vector4 } from '../../math/Vector4.js';
import { hashArray } from '../../nodes/core/NodeUtils.js';

let id = 0;

class RenderContext {

	constructor() {

		this.id = id ++;

		this.color = true;
		this.clearColor = true;
		this.clearColorValue = { r: 0, g: 0, b: 0, a: 1 };

		this.depth = true;
		this.clearDepth = true;
		this.clearDepthValue = 1;

		this.stencil = false;
		this.clearStencil = true;
		this.clearStencilValue = 1;

		this.viewport = false;
		this.viewportValue = new Vector4();

		this.scissor = false;
		this.scissorValue = new Vector4();

		this.textures = null;
		this.depthTexture = null;
		this.activeCubeFace = 0;
		this.sampleCount = 1;

		this.width = 0;
		this.height = 0;

		this.isRenderContext = true;

	}

	getCacheKey() {

		return getCacheKey( this );

	}

}

export function getCacheKey( renderContext ) {

	const { textures, activeCubeFace } = renderContext;

	const values = [ activeCubeFace ];

	for ( const texture of textures ) {

		values.push( texture.id );

	}

	return hashArray( values );

}

export default RenderContext;
