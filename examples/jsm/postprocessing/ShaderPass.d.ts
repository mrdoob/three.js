import {
  Material
} from '../../../src/Three';

import { Pass } from './Pass';

export class ShaderPass extends Pass {
  constructor(shader: object, textureID?: string);
  textureID: string;
  uniforms: object;
  material: Material;
  fsQuad: object;
}
