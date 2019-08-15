import {
  Uniform
} from '../../../src/Three';

export interface GammaCorrectionShader {
  uniforms: {
    tDiffuse: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
