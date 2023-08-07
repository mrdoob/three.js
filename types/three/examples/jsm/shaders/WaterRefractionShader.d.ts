import { Uniform } from '../../../src/Three';

export const WaterRefractionShader: {
    uniforms: {
        color: Uniform;
        time: Uniform;
        tDiffuse: Uniform;
        tDudv: Uniform;
        textureMatrix: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;
};
