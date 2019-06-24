import {
  Uniform
} from '../../../src/Three';

export interface BleachBypassShader {
  uniforms: {
    tDiffuse: Uniform;
    opacity: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
