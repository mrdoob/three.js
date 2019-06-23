import {
  Uniform
} from '../../../src/Three';

export interface SobelOperatorShader {
  uniforms: {
    tDiffuse: Uniform;
    resolution: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
