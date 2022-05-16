import { Matrix4, Vector2, Texture, IUniform } from '../../../src/Three';
/**
 * References:
 * https://lettier.github.io/3d-game-shaders-for-beginners/screen-space-reflection.html
 */

export const SSRShader: SSRShader;
export interface SSRShader {
    defines: {
        MAX_STEP: number;
        isPerspectiveCamera: boolean;
        isDistanceAttenuation: boolean;
        isFresnel: boolean;
        isInfiniteThick: boolean;
        isSelective: boolean;
    };
    uniforms: {
        tDiffuse: IUniform<Texture | null>;
        tNormal: IUniform<Texture | null>;
        tMetalness: IUniform<Texture | null>;
        tDepth: IUniform<Texture | null>;
        cameraNear: IUniform<number>;
        cameraFar: IUniform<number>;
        resolution: IUniform<Vector2>;
        cameraProjectionMatrix: IUniform<Matrix4>;
        cameraInverseProjectionMatrix: IUniform<Matrix4>;
        opacity: IUniform<number>;
        maxDistance: IUniform<number>;
        cameraRange: IUniform<number>;
        thickness: IUniform<number>;
    };
    vertexShader: string;
    fragmentShader: string;
}

export const SSRDepthShader: SSRDepthShader;
export interface SSRDepthShader {
    defines: {
        PERSPECTIVE_CAMERA: number;
    };
    uniforms: {
        tDepth: IUniform<Texture | null>;
        cameraNear: IUniform<number>;
        cameraFar: IUniform<number>;
    };
    vertexShader: string;
    fragmentShader: string;
}

export const SSRBlurShader: SSRBlurShader;
export interface SSRBlurShader {
    uniforms: {
        tDiffuse: IUniform<Texture | null>;
        resolution: IUniform<Vector2>;
        opacity: IUniform<number>;
    };
    vertexShader: string;
    fragmentShader: string;
}
