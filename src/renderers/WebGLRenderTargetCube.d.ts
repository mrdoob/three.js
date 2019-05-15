import {
  WebGLRenderTargetOptions,
  WebGLRenderTarget,
} from './WebGLRenderTarget';

export class WebGLRenderTargetCube extends WebGLRenderTarget {
  constructor(
    width: number,
    height: number,
    options?: WebGLRenderTargetOptions
  );

  activeCubeFace: number; // PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5
  activeMipMapLevel: number;
}
