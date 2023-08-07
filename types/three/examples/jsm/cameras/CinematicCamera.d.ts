import {
    PerspectiveCamera,
    ShaderMaterial,
    Scene,
    WebGLRenderer,
    OrthographicCamera,
    WebGLRenderTarget,
} from '../../../src/Three';

import { BokehShaderUniforms } from './../shaders/BokehShader2';

export class CinematicCamera extends PerspectiveCamera {
    constructor(fov: number, aspect: number, near: number, far: number);

    postprocessing: {
        enabled: boolean;
        scene: Scene;
        camera: OrthographicCamera;
        rtTextureDepth: WebGLRenderTarget;
        rtTextureColor: WebGLRenderTarget;
        bokeh_uniforms: BokehShaderUniforms;
    };
    shaderSettings: {
        rings: number;
        samples: number;
    };
    materialDepth: ShaderMaterial;
    coc: number;
    aperture: number;
    fNumber: number;
    hyperFocal: number;
    filmGauge: number;

    linearize(depth: number): number;
    smoothstep(near: number, far: number, depth: number): number;
    saturate(x: number): number;
    focusAt(focusDistance: number): void;
    initPostProcessing(): void;
    renderCinematic(scene: Scene, renderer: WebGLRenderer): void;
    setLens(focalLength: number, frameHeight?: number, fNumber?: number, coc?: number): void;
}
