import {
  Vector2,
  ShaderMaterial
} from '../../../src/Three';

import { Pass } from './Pass';

export class FilmPass extends Pass {
  constructor(noiseIntensity?: number, scanlinesIntensity?: number, scanlinesCount?: number, grayscale?: number);
  uniforms: object;
  material: ShaderMaterial;
  fsQuad: object;
}
