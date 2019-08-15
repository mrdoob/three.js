import {
  Uniform
} from '../../../src/Three';

export interface ColorifyShader {
  uniforms: {
    tDiffuse: Uniform;
    color: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
