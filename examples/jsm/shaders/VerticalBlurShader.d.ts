import {
  Uniform
} from '../../../src/Three';

export interface VerticalBlurShader {
  uniforms: {
    tDiffuse: Uniform;
    v: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
