import {
  Uniform
} from '../../../src/Three';

export interface ToneMapShader {
  uniforms: {
    tDiffuse: Uniform;
    averageLuminance: Uniform;
    luminanceMap: Uniform;
    maxLuminance: Uniform;
    minLuminance: Uniform;
    middleGrey: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
