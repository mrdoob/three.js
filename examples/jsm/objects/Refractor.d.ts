import {
  Mesh,
  BufferGeometry,
  Color,
  WebGLRenderTarget
} from '../../../src/Three';

export interface RefractorOptions {
  color?: Color;
  textureWidth?: number;
  textureHeight?: number;
  clipBias?: number;
  shader?: object;
}

export class Refractor extends Mesh {
  constructor(geometry?: BufferGeometry, options?: RefractorOptions);

  getRenderTarget(): WebGLRenderTarget;
}
