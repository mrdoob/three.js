import {
  Uniform
} from '../../../src/Three';

export interface FXAAShader {
  uniforms: {
    tDiffuse: Uniform;
    resolution: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
