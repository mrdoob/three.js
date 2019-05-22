import {
  Uniform
} from '../../../src/Three';

export interface UnpackDepthRGBAShader {
  uniforms: {
    tDiffuse: Uniform;
    opacity: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
