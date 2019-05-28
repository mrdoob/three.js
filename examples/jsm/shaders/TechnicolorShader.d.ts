import {
  Uniform
} from '../../../src/Three';

export interface TechnicolorShader {
  uniforms: {
    tDiffuse: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
