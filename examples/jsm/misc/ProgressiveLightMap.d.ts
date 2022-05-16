import {
    Camera,
    Material,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    Object3D,
    PlaneBufferGeometry,
    PlaneGeometry,
    Texture,
    Vector3,
    WebGLRenderer,
    Scene,
    WebGLRenderTarget,
} from './../../../src/Three';

export interface UVBoxes {
    w: number;
    h: number;
    index: number;
}

export interface LightMapContainers {
    basicMat: Material | Material[];
    object: Object3D;
}

export class ProgressiveLightMap {
    renderer: WebGLRenderer;
    res: number;
    lightMapContainers: LightMapContainers[];
    compiled: boolean;
    scene: Scene;
    tinyTarget: WebGLRenderTarget;
    buffer1Active: boolean;
    firstUpdate: boolean;
    warned: boolean;

    progressiveLightMap1: WebGLRenderTarget;
    progressiveLightMap2: WebGLRenderTarget;

    uvMat: MeshPhongMaterial;

    uv_boxes: UVBoxes[];

    blurringPlane: Mesh<PlaneBufferGeometry, MeshBasicMaterial>;

    labelMaterial: MeshBasicMaterial;
    labelPlane: PlaneGeometry;
    labelMesh: Mesh<PlaneGeometry, MeshBasicMaterial>;

    constructor(renderer: WebGLRenderer, res?: number);

    addObjectsToLightMap(objects: Object3D[]): void;

    update(camera: Camera, blendWindow?: number, blurEdges?: boolean): void;

    showDebugLightmap(visible: boolean, position?: Vector3): void;

    private _initializeBlurPlane(res: number, lightMap?: Texture | null): void;
}
