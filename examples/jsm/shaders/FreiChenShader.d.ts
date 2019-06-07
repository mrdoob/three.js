import {
  Uniform
} from '../../../src/Three';

export interface FreiChenShader {
  uniforms: {
    tDiffuse: Uniform;
    aspect: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
