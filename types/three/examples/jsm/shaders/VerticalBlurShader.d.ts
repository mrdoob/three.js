import { Uniform } from '../../../src/Three';

export const VerticalBlurShader: {
    uniforms: {
        tDiffuse: Uniform;
        v: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;
};
