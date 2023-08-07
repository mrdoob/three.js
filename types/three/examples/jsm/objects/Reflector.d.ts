import { Mesh, BufferGeometry, Color, TextureEncoding, WebGLRenderTarget } from '../../../src/Three';

export interface ReflectorOptions {
    color?: Color;
    textureWidth?: number;
    textureHeight?: number;
    clipBias?: number;
    shader?: object;
    encoding?: TextureEncoding;
}

export class Reflector extends Mesh {
    constructor(geometry?: BufferGeometry, options?: ReflectorOptions);

    getRenderTarget(): WebGLRenderTarget;
}
