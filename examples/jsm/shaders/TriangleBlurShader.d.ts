import { Uniform } from '../../../src/Three';

export const TriangleBlurShader: {
    uniforms: {
        texture: Uniform;
        delta: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;
};
