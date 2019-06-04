import {
  Uniform
} from '../../../src/Three';

export interface HorizontalTiltShiftShader {
  uniforms: {
    tDiffuse: Uniform;
    h: Uniform;
    r: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
