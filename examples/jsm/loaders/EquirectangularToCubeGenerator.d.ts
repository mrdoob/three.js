import {
	PixelFormat,
	Texture,
	TextureDataType,
	WebGLRenderer,
	WebGLRenderTargetCube
} from '../../../src/Three';

export interface EquirectangularToCubeGeneratorOptions {
	resolution?: number;
	format?: PixelFormat;
	type?: TextureDataType;
}

export class EquirectangularToCubeGenerator {

	constructor( sourceTexture: Texture, options?: EquirectangularToCubeGeneratorOptions );
	sourceTexture: Texture;
	resolution: number;
	renderTarget: WebGLRenderTargetCube;

	dispose(): void;
	update( renderer: WebGLRenderer ): Texture;

}
