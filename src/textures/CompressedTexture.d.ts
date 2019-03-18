import { Texture } from './Texture';
import {
  Mapping,
  Wrapping,
  TextureFilter,
  PixelFormat,
  TextureDataType,
  TextureEncoding,
} from '../constants';

export class CompressedTexture extends Texture {
  constructor(
    mipmaps: ImageData[],
    width: number,
    height: number,
    format?: PixelFormat,
    type?: TextureDataType,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: TextureFilter,
    minFilter?: TextureFilter,
    anisotropy?: number,
    encoding?: TextureEncoding
  );

  image: { width: number; height: number };
}
