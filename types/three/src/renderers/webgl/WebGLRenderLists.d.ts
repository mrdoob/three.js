import { Object3D } from './../../core/Object3D';
import { Material } from './../../materials/Material';
import { WebGLProgram } from './WebGLProgram';
import { Group } from './../../objects/Group';
import { Scene } from './../../scenes/Scene';
import { Camera } from './../../cameras/Camera';
import { BufferGeometry } from '../../core/BufferGeometry';
import { WebGLProperties } from './WebGLProperties';

// tslint:disable-next-line:no-empty-interface
export interface RenderTarget {} // not defined in the code, used in LightShadow and WebGRenderer classes

export interface RenderItem {
    id: number;
    object: Object3D;
    geometry: BufferGeometry | null;
    material: Material;
    program: WebGLProgram;
    groupOrder: number;
    renderOrder: number;
    z: number;
    group: Group | null;
}

export class WebGLRenderList {
    constructor(properties: WebGLProperties);

    /**
     * @default []
     */
    opaque: RenderItem[];

    /**
     * @default []
     */
    transparent: RenderItem[];

    init(): void;
    push(
        object: Object3D,
        geometry: BufferGeometry | null,
        material: Material,
        groupOrder: number,
        z: number,
        group: Group | null,
    ): void;
    unshift(
        object: Object3D,
        geometry: BufferGeometry | null,
        material: Material,
        groupOrder: number,
        z: number,
        group: Group | null,
    ): void;
    sort(opaqueSort: (a: any, b: any) => number, transparentSort: (a: any, b: any) => number): void;
    finish(): void;
}

export class WebGLRenderLists {
    constructor(properties: WebGLProperties);

    dispose(): void;
    get(scene: Scene, camera: Camera): WebGLRenderList;
}
