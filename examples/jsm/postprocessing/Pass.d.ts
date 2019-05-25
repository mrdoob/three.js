import {
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
