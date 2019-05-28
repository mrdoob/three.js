import { Texture } from './Texture';
import { NearestFilter } from '../constants';
import { TypedArray } from '../polyfills';

export class DataTexture2DArray extends Texture {

	constructor(
    data: ArrayBuffer | TypedArray,
    width: number,
    height: number,
    depth: number
  );

}
