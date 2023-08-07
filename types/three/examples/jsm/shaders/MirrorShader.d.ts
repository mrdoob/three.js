import { Uniform } from '../../../src/Three';

export const MirrorShader: {
    uniforms: {
        tDiffuse: Uniform;
        side: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;
};
