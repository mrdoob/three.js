import {
    Vector2,
    Scene,
    Camera,
    Object3D,
    Color,
    Matrix4,
    MeshBasicMaterial,
    MeshDepthMaterial,
    ShaderMaterial,
    WebGLRenderTarget,
    Texture,
} from '../../../src/Three';

import { Pass } from './Pass';

export class OutlinePass extends Pass {
    constructor(resolution: Vector2, scene: Scene, camera: Camera, selectedObjects?: Object3D[]);
    renderScene: Scene;
    renderCamera: Camera;
    selectedObjects: Object3D[];
    visibleEdgeColor: Color;
    hiddenEdgeColor: Color;
    edgeGlow: number;
    usePatternTexture: boolean;
    edgeThickness: number;
    edgeStrength: number;
    downSampleRatio: number;
    pulsePeriod: number;
    resolution: Vector2;
    patternTexture: Texture;

    maskBufferMaterial: MeshBasicMaterial;
    renderTargetMaskBuffer: WebGLRenderTarget;
    depthMaterial: MeshDepthMaterial;
    prepareMaskMaterial: ShaderMaterial;
    renderTargetDepthBuffer: WebGLRenderTarget;
    renderTargetMaskDownSampleBuffer: WebGLRenderTarget;
    renderTargetBlurBuffer1: WebGLRenderTarget;
    renderTargetBlurBuffer2: WebGLRenderTarget;
    edgeDetectionMaterial: ShaderMaterial;
    renderTargetEdgeBuffer1: WebGLRenderTarget;
    renderTargetEdgeBuffer2: WebGLRenderTarget;
    separableBlurMaterial1: ShaderMaterial;
    separableBlurMaterial2: ShaderMaterial;
    overlayMaterial: ShaderMaterial;
    copyUniforms: object;
    materialCopy: ShaderMaterial;
    oldClearColor: Color;
    oldClearAlpha: number;
    fsQuad: object;
    tempPulseColor1: Color;
    tempPulseColor2: Color;
    textureMatrix: Matrix4;

    dispose(): void;
    changeVisibilityOfSelectedObjects(bVisible: boolean): void;
    changeVisibilityOfNonSelectedObjects(bVisible: boolean): void;
    updateTextureMatrix(): void;
    getPrepareMaskMaterial(): ShaderMaterial;
    getEdgeDetectionMaterial(): ShaderMaterial;
    getSeperableBlurMaterial(): ShaderMaterial;
    getOverlayMaterial(): ShaderMaterial;
}
