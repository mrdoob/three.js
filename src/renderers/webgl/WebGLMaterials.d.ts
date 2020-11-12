import { Material } from '../../materials/Material';
import { IFog } from '../../scenes/Fog';
import { WebGLProperties } from './WebGLProperties';

export class WebGLMaterials {

	constructor( properties: WebGLProperties );

	refreshMaterialUniforms( uniforms: object, material: Material, pixelRatio: number, height: number ): void;
	refreshFogUniforms( uniforms: object, fog: IFog ): void;

}
