import {
  Uniform
} from '../../../src/Three';

export const SobelOperatorShader: {
  uniforms: {
    tDiffuse: Uniform;
    resolution: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
