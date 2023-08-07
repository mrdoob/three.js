import {
    CubeTexture,
    LoadingManager,
    DataTextureLoader,
    PixelFormat,
    TextureDataType,
    TextureEncoding,
} from '../../../src/Three';

export interface RGBM {
    width: number;
    height: number;
    data: Uint8Array;
    header: string;
    format: PixelFormat;
    type: TextureDataType;
    flipY: boolean;
    encoding: TextureEncoding;
}

export class RGBMLoader extends DataTextureLoader {
    constructor(manager?: LoadingManager);

    loadCubemap(
        urls: string[],
        onLoad?: (texture: CubeTexture) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): CubeTexture;

    parse(buffer: ArrayBuffer): RGBM;
}
