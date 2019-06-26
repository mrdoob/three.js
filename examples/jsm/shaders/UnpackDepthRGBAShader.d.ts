import {
  Uniform
} from '../../../src/Three';

export const UnpackDepthRGBAShader: {
  uniforms: {
    tDiffuse: Uniform;
    opacity: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
