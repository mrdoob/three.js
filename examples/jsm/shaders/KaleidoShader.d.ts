import {
  Uniform
} from '../../../src/Three';

export interface KaleidoShader {
  uniforms: {
    tDiffuse: Uniform;
    sides: Uniform;
    angle: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
