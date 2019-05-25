import {
  Uniform
} from '../../../src/Three';

export interface FocusShader {
  uniforms: {
    tDiffuse: Uniform;
    screenWidth: Uniform;
    screenHeight: Uniform;
    sampleDistance: Uniform;
    waveFactor: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
