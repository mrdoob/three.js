import { CompressedPixelFormat, TextureEncoding } from '../../constants';

export class WebGLUtils {
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, extensions: any, capabilities: any);

    convert(p: CompressedPixelFormat, encoding?: TextureEncoding | null): void;
}
