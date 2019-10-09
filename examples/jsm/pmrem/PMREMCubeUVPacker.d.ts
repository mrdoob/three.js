import { CubeTexture, Renderer, WebGLRenderTarget } from '../../../src/Three';

export class PMREMCubeUVPacker {

	CubeUVRenderTarget:WebGLRenderTarget;

	constructor( cubeTextureLods: CubeTexture[] );
	update( renderer:Renderer ): void;
	dispose(): void;

}
