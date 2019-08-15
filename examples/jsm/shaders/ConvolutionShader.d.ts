import {
  Uniform
} from '../../../src/Three';

export interface ConvolutionShader {
  defines: {
    KERNEL_SIZE_FLOAT: string;
    KERNEL_SIZE_INT: string;
  },
  uniforms: {
    tDiffuse: Uniform;
    uImageIncrement: Uniform;
    cKernel: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;

  buildKernel(sigma: number): number[];
}
