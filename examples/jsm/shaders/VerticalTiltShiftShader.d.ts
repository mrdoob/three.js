import {
  Uniform
} from '../../../src/Three';

export interface VerticalTiltShiftShader {
  uniforms: {
    tDiffuse: Uniform;
    v: Uniform;
    r: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
