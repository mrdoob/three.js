import {
  Uniform
} from '../../../src/Three';

export interface WaterRefractionShader {
  uniforms: {
    color: Uniform;
    time: Uniform;
    tDiffuse: Uniform;
    tDudv: Uniform;
    textureMatrix: Uniform;
  };
  vertexShader: string;
  fragmentShader:string;
}
