import { CompressedPixelFormat, CompressedTextureLoader } from '../../../src/Three';

export interface DDS {
  mipmaps: ImageData[];
  width: number;
  height: number;
  format: CompressedPixelFormat;
  mipmapCount: number;
}

export class DDSLoader extends CompressedTextureLoader {
  constructor();
  parse(buffer: string, loadMipmaps: boolean): DDS;
}
