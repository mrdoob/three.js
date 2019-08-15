import {
  Uniform
} from '../../../src/Three';

export interface BrightnessContrastShader {
  uniforms: {
    tDiffuse: Uniform;
    brightness: Uniform;
    contrast: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
