import {
    Color,
    MeshNormalMaterial,
    MeshBasicMaterial,
    ShaderMaterial,
    WebGLRenderTarget,
    Scene,
    WebGLRenderer,
    Camera,
    Mesh,
    Material,
    ColorRepresentation,
} from '../../../src/Three';
import { Pass, FullScreenQuad } from '../postprocessing/Pass';
import { Reflector } from '../objects/ReflectorForSSRPass';

export interface SSRPassParams {
    renderer: WebGLRenderer;
    scene: Scene;
    camera: Camera;
    width?: number | undefined;
    height?: number | undefined;
    selects: Mesh[] | null;
    isPerspectiveCamera?: boolean | undefined;
    isBouncing?: boolean | undefined;
    groundReflector: Reflector | null;
}

export class SSRPass extends Pass {
    width: number;
    height: number;
    clear: boolean;
    renderer: WebGLRenderer;
    scene: Scene;
    camera: Camera;
    groundReflector: Reflector | null;
    opacity: number;
    output: number;
    maxDistance: number;
    thickness: number;
    tempColor: Color;

    get selects(): Mesh[] | null;
    set selects(val: Mesh[] | null);
    selective: boolean;
    get isBouncing(): boolean;
    set isBouncing(val: boolean);

    blur: boolean;

    get isDistanceAttenuation(): boolean;
    set isDistanceAttenuation(val: boolean);
    get isFresnel(): boolean;
    set isFresnel(val: boolean);
    get isInfiniteThick(): boolean;
    set isInfiniteThick(val: boolean);

    thickTolerance: number;

    beautyRenderTarget: WebGLRenderTarget;
    prevRenderTarget: WebGLRenderTarget;
    normalRenderTarget: WebGLRenderTarget;
    metalnessRenderTarget: WebGLRenderTarget;
    ssrRenderTarget: WebGLRenderTarget;

    blurRenderTarget: WebGLRenderTarget;
    blurRenderTarget2: WebGLRenderTarget;

    ssrMaterial: ShaderMaterial;

    normalMaterial: MeshNormalMaterial;

    metalnessOnMaterial: MeshBasicMaterial;

    metalnessOffMaterial: MeshBasicMaterial;

    blurMaterial: ShaderMaterial;
    blurMaterial2: ShaderMaterial;

    depthRenderMaterial: ShaderMaterial;

    copyMaterial: ShaderMaterial;

    fsQuad: FullScreenQuad;

    originalClearColor: Color;

    static OUTPUT: {
        Default: 0;
        SSR: 1;
        Beauty: 3;
        Depth: 4;
        Normal: 5;
        Metalness: 7;
    };

    constructor(params: SSRPassParams);

    dispose: () => void;

    renderPass: (
        renderer: WebGLRenderer,
        passMaterial: Material,
        renderTarget: WebGLRenderTarget,
        clearColor: ColorRepresentation,
        clearAlpha: ColorRepresentation,
    ) => void;

    renderOverride: (
        renderer: WebGLRenderer,
        passMaterial: Material,
        renderTarget: WebGLRenderTarget,
        clearColor: ColorRepresentation,
        clearAlpha: ColorRepresentation,
    ) => void;

    renderMetalness: (
        renderer: WebGLRenderer,
        passMaterial: Material,
        renderTarget: WebGLRenderTarget,
        clearColor: ColorRepresentation,
        clearAlpha: ColorRepresentation,
    ) => void;
}
