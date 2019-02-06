import { UnsignedByteType, FloatType, DataTextureLoader } from '../../../src/Three';

export class RGBELoader extends DataTextureLoader {
  type: UnsignedByteType | FloatType;
  setType(value: UnsignedByteType | FloatType): RGBELoader;
}
