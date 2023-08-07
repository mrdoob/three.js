import { Camera } from './../../cameras/Camera';
import { Material } from './../../materials/Material';
import { WebGLProperties } from './WebGLProperties';

export class WebGLClipping {
    constructor(properties: WebGLProperties);

    uniform: { value: any; needsUpdate: boolean };

    /**
     * @default 0
     */
    numPlanes: number;

    /**
     * @default 0
     */
    numIntersection: number;

    init(planes: any[], enableLocalClipping: boolean, camera: Camera): boolean;
    beginShadows(): void;
    endShadows(): void;
    setState(material: Material, camera: Camera, useCache: boolean): void;
}
