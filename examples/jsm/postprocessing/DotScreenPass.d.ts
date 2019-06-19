import {
  Vector2,
  ShaderMaterial
} from '../../../src/Three';

import { Pass } from './Pass';

export class DotScreenPass extends Pass {
  constructor(center?: Vector2, angle?: number, scale?: number);
  uniforms: object;
  material: ShaderMaterial;
  fsQuad: object;
}
