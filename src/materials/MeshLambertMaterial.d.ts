import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';
import { MaterialParameters, Material } from './Material';
import { Combine } from '../constants';

export interface MeshLambertMaterialParameters extends MaterialParameters {
	color?: Color | string | number;
	emissive?: Color | string | number;
	emissiveIntensity?: number;
	emissiveMap?: Texture;
	map?: Texture;
	lightMap?: Texture;
	lightMapIntensity?: number;
	aoMap?: Texture;
	aoMapIntensity?: number;
	specularMap?: Texture;
	alphaMap?: Texture;
	envMap?: Texture;
	combine?: Combine;
	reflectivity?: number;
	refractionRatio?: number;
	wireframe?: boolean;
	wireframeLinewidth?: number;
	wireframeLinecap?: string;
	wireframeLinejoin?: string;
	skinning?: boolean;
	morphTargets?: boolean;
	morphNormals?: boolean;
}

export class MeshLambertMaterial extends Material {

	constructor( parameters?: MeshLambertMaterialParameters );

	color: Color;
	emissive: Color;
	emissiveIntensity: number;
	emissiveMap: Texture | null;
	map: Texture | null;
	lightMap: Texture | null;
	lightMapIntensity: number;
	aoMap: Texture | null;
	aoMapIntensity: number;
	specularMap: Texture | null;
	alphaMap: Texture | null;
	envMap: Texture | null;
	combine: Combine;
	reflectivity: number;
	refractionRatio: number;
	wireframe: boolean;
	wireframeLinewidth: number;
	wireframeLinecap: string;
	wireframeLinejoin: string;
	skinning: boolean;
	morphTargets: boolean;
	morphNormals: boolean;

	setValues( parameters: MeshLambertMaterialParameters ): void;

}
