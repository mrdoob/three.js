import {
  Uniform
} from '../../../src/Three';

export interface RGBShiftShader {
  uniforms: {
    tDiffuse: Uniform;
    amount: Uniform;
    angle: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
