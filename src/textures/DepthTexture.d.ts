import { Texture } from './Texture';
import {
	Mapping,
	Wrapping,
	TextureFilter,
	TextureDataType,
} from '../constants';

export class DepthTexture extends Texture {

	constructor(
    width: number,
    heighht: number,
    type?: TextureDataType,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: TextureFilter,
    minFilter?: TextureFilter,
    anisotropy?: number
  );

  image: { width: number; height: number };

}
