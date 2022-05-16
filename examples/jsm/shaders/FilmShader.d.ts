import { Uniform } from '../../../src/Three';

export const FilmShader: {
    uniforms: {
        tDiffuse: Uniform;
        time: Uniform;
        nIntensity: Uniform;
        sIntensity: Uniform;
        sCount: Uniform;
        grayscale: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;
};
