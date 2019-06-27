import {
  Uniform
} from '../../../src/Three';

export const HorizontalBlurShader: {
  uniforms: {
    tDiffuse: Uniform;
    h: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
