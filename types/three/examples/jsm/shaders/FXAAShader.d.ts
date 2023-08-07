import { Uniform } from '../../../src/Three';

export const FXAAShader: {
    uniforms: {
        tDiffuse: Uniform;
        resolution: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;
};
