import {
  Uniform
} from '../../../src/Three';

export interface CopyShader {
  uniforms: {
    tDiffuse: Uniform;
    opacity: Uniform;
  };
  vertexShader: string;
  fragmentShader:string;
}
