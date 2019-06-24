import {
  Uniform
} from '../../../src/Three';

export interface MirrorShader {
  uniforms: {
    tDiffuse: Uniform;
    side: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
