import {
  Uniform
} from '../../../src/Three';

export const SepiaShader: {
  uniforms: {
    tDiffuse: Uniform;
    amount: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
