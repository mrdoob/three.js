import {
  Material,
  WebGLRenderer,
  WebGLRenderTarget
} from '../../../src/Three';

export class Pass {
  constructor();
  enabled: boolean;
  needsSwap: boolean;
  clear: boolean;
  renderToScreen: boolean;

  setSize(width: number, height: number): void;
  render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget, deltaTime: number, maskActive: boolean): void;
}

export namespace Pass {
	class FullScreenQuad {
		constructor( material?: Material );

		render( renderer: WebGLRenderer ): void;

		material: Material;
	}
}
