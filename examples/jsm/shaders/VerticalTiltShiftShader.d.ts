import {
  Uniform
} from '../../../src/Three';

export const VerticalTiltShiftShader: {
  uniforms: {
    tDiffuse: Uniform;
    v: Uniform;
    r: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
