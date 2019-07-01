import {
  Uniform
} from '../../../src/Three';

export const BlendShader: {
  uniforms: {
    tDiffuse1: Uniform;
    tDiffuse2: Uniform;
    mixRatio: Uniform;
    opacity: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
