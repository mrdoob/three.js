import {
  Uniform
} from '../../../src/Three';

export interface TriangleBlurShader {
  uniforms: {
    texture: Uniform;
    delta: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
