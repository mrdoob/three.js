import { Uniform } from '../../../src/Three';

export const GammaCorrectionShader: {
    uniforms: {
        tDiffuse: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;
};
