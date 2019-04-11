import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import { MaterialParameters, Material } from './Material';
import { NormalMapTypes } from '../constants';

export interface MeshMatcapMaterialParameters extends MaterialParameters {

	color?: Color | string | number;
	matMap?: Texture;
	map?: Texture;
	bumpMap?: Texture;
	bumpScale?: number;
	normalMap?: Texture;
	normalMapType?: NormalMapTypes;
	normalScale?: Vector2;
	displacementMap?: Texture;
	displacementScale?: number;
	displacementBias?: number;
	alphaMap?: Texture;
	skinning?: boolean;
	morphTargets?: boolean;
	morphNormals?: boolean;
}

export class MeshMatcapMaterial extends Material {
	constructor(parameters?: MeshMatcapMaterialParameters);

	color: Color;
	matMap: Texture | null;
	map: Texture | null;
	bumpMap: Texture | null;
	bumpScale: number;
	normalMap: Texture | null;
	normalMapType: NormalMapTypes;
	normalScale: Vector2;
	displacementMap: Texture | null;
	displacementScale: number;
	displacementBias: number;
	alphaMap: Texture | null;
	skinning: boolean;
	morphTargets: boolean;
	morphNormals: boolean;

	setValues(parameters: MeshMatcapMaterialParameters): void;
}
