import { Material } from "../../materials/Material";
import { Texture } from "../../textures/Texture";
import { IFog } from "../../scenes/Fog";

export class WebGLMaterials {

	constructor();

	refreshUniforms( uniforms: object, material: Material, environment: Texture );
	refreshUniformsFog( uniforms: object, fog: IFog );

}
