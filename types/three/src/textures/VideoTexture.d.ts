import { Texture } from './Texture';
import { Mapping, Wrapping, TextureFilter, PixelFormat, TextureDataType } from '../constants';

export class VideoTexture extends Texture {
    /**
     * @param video
     * @param [mapping=THREE.Texture.DEFAULT_MAPPING]
     * @param [wrapS=THREE.ClampToEdgeWrapping]
     * @param [wrapT=THREE.ClampToEdgeWrapping]
     * @param [magFilter=THREE.LinearFilter]
     * @param [minFilter=THREE.LinearFilter]
     * @param [format=THREE.RGBFormat]
     * @param [type=THREE.UnsignedByteType]
     * @param [anisotropy=1]
     */
    constructor(
        video: HTMLVideoElement,
        mapping?: Mapping,
        wrapS?: Wrapping,
        wrapT?: Wrapping,
        magFilter?: TextureFilter,
        minFilter?: TextureFilter,
        format?: PixelFormat,
        type?: TextureDataType,
        anisotropy?: number,
    );

    readonly isVideoTexture: true;

    /**
     * @default false
     */
    generateMipmaps: boolean;
}
