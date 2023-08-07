import { Uniform } from '../../../src/core/Uniform';

export const ConvolutionShader: {
    defines: {
        KERNEL_SIZE_FLOAT: string;
        KERNEL_SIZE_INT: string;
    };
    uniforms: {
        tDiffuse: Uniform;
        uImageIncrement: Uniform;
        cKernel: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;

    buildKernel(sigma: number): number[];
};
