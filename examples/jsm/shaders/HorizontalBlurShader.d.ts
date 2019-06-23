import {
  Uniform
} from '../../../src/Three';

export interface HorizontalBlurShader {
  uniforms: {
    tDiffuse: Uniform;
    h: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
