import { Matrix4, Vector2, IUniform, Texture } from '../../../src/Three';

export interface SSRrShader {
    defines: {
        MAX_STEP: number;
        PERSPECTIVE_CAMERA: boolean;
        SPECULAR: boolean;
        FILL_HOLE: boolean;
        INFINITE_THICK: boolean;
    };

    uniforms: {
        tDiffuse: IUniform<Texture | null>;
        tSpecular: IUniform<Texture | null>;
        tNormalSelects: IUniform<Texture | null>;
        tRefractive: IUniform<Texture | null>;
        tDepthSelects: IUniform<Texture | null>;
        cameraNear: IUniform<number | null>;
        cameraFar: IUniform<number | null>;
        resolution: IUniform<Vector2>;
        cameraProjectionMatrix: IUniform<Matrix4>;
        cameraInverseProjectionMatrix: IUniform<Matrix4>;
        ior: IUniform<number>;
        cameraRange: IUniform<number>;
        maxDistance: IUniform<number>;
        surfDist: IUniform<number>;
    };

    vertexShader: string;

    fragmentShader: string;
}

export interface SSRrDepthShader {
    defines: {
        PERSPECTIVE_CAMERA: number;
    };

    uniforms: {
        tDepth: IUniform<Texture | null>;
        cameraNear: IUniform<number | null>;
        cameraFar: IUniform<number | null>;
    };

    vertexShader: string;

    fragmentShader: string;
}
