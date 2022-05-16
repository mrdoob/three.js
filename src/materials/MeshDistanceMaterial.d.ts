import { MaterialParameters, Material } from './Material';
import { Vector3 } from './../math/Vector3';
import { Texture } from './../textures/Texture';

export interface MeshDistanceMaterialParameters extends MaterialParameters {
    map?: Texture | null | undefined;
    alphaMap?: Texture | null | undefined;
    displacementMap?: Texture | null | undefined;
    displacementScale?: number | undefined;
    displacementBias?: number | undefined;
    farDistance?: number | undefined;
    nearDistance?: number | undefined;
    referencePosition?: Vector3 | undefined;
}

export class MeshDistanceMaterial extends Material {
    constructor(parameters?: MeshDistanceMaterialParameters);

    /**
     * @default 'MeshDistanceMaterial'
     */
    type: string;

    /**
     * @default null
     */
    map: Texture | null;

    /**
     * @default null
     */
    alphaMap: Texture | null;

    /**
     * @default null
     */
    displacementMap: Texture | null;

    /**
     * @default 1
     */
    displacementScale: number;

    /**
     * @default 0
     */
    displacementBias: number;

    /**
     * @default 1000
     */
    farDistance: number;

    /**
     * @default 1
     */
    nearDistance: number;

    /**
     * @default new THREE.Vector3()
     */
    referencePosition: Vector3;

    /**
     * @default false
     */
    fog: boolean;

    setValues(parameters: MeshDistanceMaterialParameters): void;
}
