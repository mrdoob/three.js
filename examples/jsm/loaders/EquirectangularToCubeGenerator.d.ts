import {
	PixelFormat,
	Texture,
	TextureDataType,
	WebGLRenderer
} from '../../../src/Three';

export interface EquirectangularToCubeGeneratorOptions {
	resolution?: number;
	format?: PixelFormat;
	type?: TextureDataType;
}

export class EquirectangularToCubeGenerator {

	constructor( sourceTexture: Texture, options?: EquirectangularToCubeGeneratorOptions );

	dispose(): void;
	update( renderer: WebGLRenderer ): Texture;

}
