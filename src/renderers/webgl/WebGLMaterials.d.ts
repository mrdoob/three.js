import { Material } from "../../materials/Material";
import { Texture } from "../../textures/Texture";
import { IFog } from "../../scenes/Fog";
import { WebGLProperties } from "./WebGLProperties";

export class WebGLMaterials {

	constructor( properties: WebGLProperties );

	refreshMaterialUniforms( uniforms: object, material: Material, environment: Texture, pixelRatio: number, height: number ): void;
	refreshFogUniforms( uniforms: object, fog: IFog ): void;

}
