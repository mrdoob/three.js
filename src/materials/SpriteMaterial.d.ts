import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';
import { MaterialParameters, Material } from './Material';

export interface SpriteMaterialParameters extends MaterialParameters {
	color?: Color | string | number;
	map?: Texture;
	rotation?: number;
	sizeAttenuation?: boolean;
}

export class SpriteMaterial extends Material {

	constructor( parameters?: SpriteMaterialParameters );

	color: Color;
	map: Texture | null;
	rotation: number;
	sizeAttenuation: boolean;
	isSpriteMaterial: true;

	setValues( parameters: SpriteMaterialParameters ): void;
	copy( source: SpriteMaterial ): this;

}
