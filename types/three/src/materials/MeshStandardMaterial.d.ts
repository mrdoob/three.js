import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import { MaterialParameters, Material } from './Material';
import { NormalMapTypes } from '../constants';
import { ColorRepresentation } from '../utils';

export interface MeshStandardMaterialParameters extends MaterialParameters {
    color?: ColorRepresentation | undefined;
    roughness?: number | undefined;
    metalness?: number | undefined;
    map?: Texture | null | undefined;
    lightMap?: Texture | null | undefined;
    lightMapIntensity?: number | undefined;
    aoMap?: Texture | null | undefined;
    aoMapIntensity?: number | undefined;
    emissive?: ColorRepresentation | undefined;
    emissiveIntensity?: number | undefined;
    emissiveMap?: Texture | null | undefined;
    bumpMap?: Texture | null | undefined;
    bumpScale?: number | undefined;
    normalMap?: Texture | null | undefined;
    normalMapType?: NormalMapTypes | undefined;
    normalScale?: Vector2 | undefined;
    displacementMap?: Texture | null | undefined;
    displacementScale?: number | undefined;
    displacementBias?: number | undefined;
    roughnessMap?: Texture | null | undefined;
    metalnessMap?: Texture | null | undefined;
    alphaMap?: Texture | null | undefined;
    envMap?: Texture | null | undefined;
    envMapIntensity?: number | undefined;
    refractionRatio?: number | undefined;
    wireframe?: boolean | undefined;
    wireframeLinewidth?: number | undefined;
    vertexTangents?: boolean | undefined;
    morphTargets?: boolean | undefined;
    morphNormals?: boolean | undefined;
    flatShading?: boolean | undefined;
}

export class MeshStandardMaterial extends Material {
    constructor(parameters?: MeshStandardMaterialParameters);

    /**
     * @default 'MeshStandardMaterial'
     */
    type: string;

    /**
     * @default { 'STANDARD': '' }
     */
    defines: { [key: string]: any };

    /**
     * @default new THREE.Color( 0xffffff )
     */
    color: Color;

    /**
     * @default 1
     */
    roughness: number;

    /**
     * @default 0
     */
    metalness: number;

    /**
     * @default null
     */
    map: Texture | null;

    /**
     * @default null
     */
    lightMap: Texture | null;

    /**
     * @default 1
     */
    lightMapIntensity: number;

    /**
     * @default null
     */
    aoMap: Texture | null;

    /**
     * @default 1
     */
    aoMapIntensity: number;

    /**
     * @default new THREE.Color( 0x000000 )
     */
    emissive: Color;

    /**
     * @default 1
     */
    emissiveIntensity: number;

    /**
     * @default null
     */
    emissiveMap: Texture | null;

    /**
     * @default null
     */
    bumpMap: Texture | null;

    /**
     * @default 1
     */
    bumpScale: number;

    /**
     * @default null
     */
    normalMap: Texture | null;

    /**
     * @default THREE.TangentSpaceNormalMap
     */
    normalMapType: NormalMapTypes;

    /**
     * @default new THREE.Vector2( 1, 1 )
     */
    normalScale: Vector2;

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
     * @default null
     */
    roughnessMap: Texture | null;

    /**
     * @default null
     */
    metalnessMap: Texture | null;

    /**
     * @default null
     */
    alphaMap: Texture | null;

    /**
     * @default null
     */
    envMap: Texture | null;

    /**
     * @default 1
     */
    envMapIntensity: number;

    /**
     * @default 0.98
     */
    refractionRatio: number;

    /**
     * @default false
     */
    wireframe: boolean;

    /**
     * @default 1
     */
    wireframeLinewidth: number;

    /**
     * @default 'round'
     */
    wireframeLinecap: string;

    /**
     * @default 'round'
     */
    wireframeLinejoin: string;

    /**
     * @default false
     */
    vertexTangents: boolean;

    /**
     * @default false
     */
    morphTargets: boolean;

    /**
     * @default false
     */
    morphNormals: boolean;

    /**
     * Define whether the material is rendered with flat shading. Default is false.
     * @default false
     */
    flatShading: boolean;

    isMeshStandardMaterial: boolean;

    setValues(parameters: MeshStandardMaterialParameters): void;
}
