import { Texture } from './Texture';
import {
  Mapping,
  Wrapping,
  TextureFilter,
  PixelFormat,
  TextureDataType,
} from '../constants';

export class CanvasTexture extends Texture {
  constructor(
    canvas: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: TextureFilter,
    minFilter?: TextureFilter,
    format?: PixelFormat,
    type?: TextureDataType,
    anisotropy?: number
  );
}
