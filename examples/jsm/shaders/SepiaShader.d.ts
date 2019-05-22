import {
  Uniform
} from '../../../src/Three';

export interface SepiaShader {
  uniforms: {
    tDiffuse: Uniform;
    amount: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
