import { Vector4 } from 'three';

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

		this.stencil = true;
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

}

export default RenderContext;
