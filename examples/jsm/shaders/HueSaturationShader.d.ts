import {
  Uniform
} from '../../../src/Three';

export interface HueSaturationShader {
  uniforms: {
    tDiffuse: Uniform;
    hue: Uniform;
    saturation: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
