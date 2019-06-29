import {
  PixelFormat,
  Texture,
  TextureDataType,
  TextureFilter,
  WebGLRenderer,
  WebGLRenderTargetCube
} from '../../../src/Three';

export interface CubemapGeneratorOptions {
  resolution?: number;
  generateMipmaps?: boolean;
  magFilter?: TextureFilter;
  minFilter?: TextureFilter;
}

export interface EquirectangularToCubeGeneratorOptions {
  resolution?: number;
  format?: PixelFormat;
  type?: TextureDataType;
}

export class CubemapGenerator {
  constructor(renderer: WebGLRenderer);

  fromEquirectangular(texture: Texture, options?: CubemapGeneratorOptions): WebGLRenderTargetCube;
}

export class EquirectangularToCubeGenerator {
  constructor(sourceTexture: Texture, options?: EquirectangularToCubeGeneratorOptions);

  dispose(): void;
  update(renderer: WebGLRenderer): Texture;
}
