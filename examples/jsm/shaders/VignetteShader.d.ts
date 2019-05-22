import {
  Uniform
} from '../../../src/Three';

export interface VignetteShader {
  uniforms: {
    tDiffuse: Uniform;
    offset: Uniform;
    darkness: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
