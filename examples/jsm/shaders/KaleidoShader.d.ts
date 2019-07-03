import {
  Uniform
} from '../../../src/Three';

export const KaleidoShader: {
  uniforms: {
    tDiffuse: Uniform;
    sides: Uniform;
    angle: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
