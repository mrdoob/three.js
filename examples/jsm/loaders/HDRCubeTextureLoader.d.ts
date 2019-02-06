import { UnsignedByteType, FloatType, DataTextureLoader } from '../../../src/Three';
import { RGBALoader } from './RGBELoader';

export class HDRCubeTextureLoader extends DataTextureLoader {
  hdrLoader: RGBALoader;
}
