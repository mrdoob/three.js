import {
  Uniform
} from '../../../src/Three';

export interface ColorCorrectionShader {
  uniforms: {
    tDiffuse: Uniform;
    powRGB: Uniform;
    mulRGB: Uniform;
    addRGB: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
