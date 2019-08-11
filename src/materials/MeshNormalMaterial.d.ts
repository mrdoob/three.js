import { MaterialParameters, Material } from './Material';
import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import { NormalMapTypes } from '../constants';

export interface MeshNormalMaterialParameters extends MaterialParameters {

	bumpMap?: Texture;
	bumpScale?: number;
	normalMap?: Texture;
	normalMapType?: NormalMapTypes;
	normalScale?: Vector2;
	displacementMap?: Texture;
	displacementScale?: number;
	displacementBias?: number;
	wireframe?: boolean;
	wireframeLinewidth?: number;
	skinning?: boolean;
	morphTargets?: boolean;
	morphNormals?: boolean;
}

export class MeshNormalMaterial extends Material {

	constructor( parameters?: MeshNormalMaterialParameters );

	bumpMap: Texture | null;
	bumpScale: number;
	normalMap: Texture | null;
	normalMapType: NormalMapTypes;
	normalScale: Vector2;
	displacementMap: Texture | null;
	displacementScale: number;
	displacementBias: number;
	wireframe: boolean;
	wireframeLinewidth: number;
	skinning: boolean;
	morphTargets: boolean;
	morphNormals: boolean;

	setValues( parameters: MeshNormalMaterialParameters ): void;

}
