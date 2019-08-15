import {
  Uniform
} from '../../../src/Three';

export interface DOFMipMapShader {
  uniforms: {
    tColor: Uniform;
    tDepth: Uniform;
    focus: Uniform;
    maxblur: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
