import { Uniform } from '../../../src/Three';

export const AfterimageShader: {
    uniforms: {
        damp: Uniform;
        tOld: Uniform;
        tNew: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;
};
