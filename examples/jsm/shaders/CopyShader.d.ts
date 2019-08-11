import {
  Uniform
} from '../../../src/Three';

export const CopyShader: {
  uniforms: {
    tDiffuse: Uniform;
    opacity: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
