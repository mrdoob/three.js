import {
  Uniform
} from '../../../src/Three';

export interface PixelShader {
  uniforms: {
    tDiffuse: Uniform;
    resolution: Uniform;
    pixelSize: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
