import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import { MeshStandardMaterialParameters, MeshStandardMaterial } from './MeshStandardMaterial';
import { Color } from './../math/Color';

export interface MeshPhysicalMaterialParameters extends MeshStandardMaterialParameters {
    clearcoat?: number | undefined;
    clearcoatMap?: Texture | null | undefined;
    clearcoatRoughness?: number | undefined;
    clearcoatRoughnessMap?: Texture | null | undefined;
    clearcoatNormalScale?: Vector2 | undefined;
    clearcoatNormalMap?: Texture | null | undefined;

    reflectivity?: number | undefined;
    ior?: number | undefined;

    sheen?: number | undefined;
    sheenColor?: Color | undefined;
    sheenRoughness?: number | undefined;

    transmission?: number | undefined;
    transmissionMap?: Texture | null | undefined;
    attenuationDistance?: number | undefined;
    attenuationColor?: Color | undefined;

    specularIntensity?: number | undefined;
    specularColor?: Color | undefined;
    specularIntensityMap?: Texture | null | undefined;
    specularColorMap?: Texture | null | undefined;
}

export class MeshPhysicalMaterial extends MeshStandardMaterial {
    constructor(parameters?: MeshPhysicalMaterialParameters);

    /**
     * @default 'MeshPhysicalMaterial'
     */
    type: string;

    /**
     * @default { 'STANDARD': '', 'PHYSICAL': '' }
     */
    defines: { [key: string]: any };

    /**
     * @default 0
     */
    clearcoat: number;

    /**
     * @default null
     */
    clearcoatMap: Texture | null;

    /**
     * @default 0
     */
    clearcoatRoughness: number;

    /**
     * @default null
     */
    clearcoatRoughnessMap: Texture | null;

    /**
     * @default new THREE.Vector2( 1, 1 )
     */
    clearcoatNormalScale: Vector2;

    /**
     * @default null
     */
    clearcoatNormalMap: Texture | null;

    /**
     * @default 0.5
     */
    reflectivity: number;

    /**
     * @default 1.5
     */
    ior: number;

    /**
     * @default 0.0
     */
    sheen: number;

    /**
     * @default Color( 0x000000 )
     */
    sheenColor: Color;

    /**
     * @default null
     */
    sheenColorMap: Texture | null;

    /**
     * @default 1.0
     */
    sheenRoughness: number;

    /**
     * @default null
     */
    sheenRoughnessMap: Texture | null;

    /**
     * @default 0
     */
    transmission: number;

    /**
     * @default null
     */
    transmissionMap: Texture | null;

    /**
     * @default 0.01
     */
    thickness: number;

    /**
     * @default null
     */
    thicknessMap: Texture | null;

    /**
     * @default 0.0
     */
    attenuationDistance: number;

    /**
     * @default Color( 1, 1, 1 )
     */
    attenuationColor: Color;

    /**
     * @default 1.0
     */
    specularIntensity: number;

    /**
     * @default Color(1, 1, 1)
     */
    specularColor: Color;

    /**
     * @default null
     */
    specularIntensityMap: Texture | null;

    /**
     * @default null
     */
    specularColorMap: Texture | null;
}
