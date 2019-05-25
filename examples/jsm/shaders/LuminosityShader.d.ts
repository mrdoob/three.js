import {
  Uniform
} from '../../../src/Three';

export interface LuminosityShader {
  uniforms: {
    tDiffuse: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
