import {
	WebGLRenderer,
	WebGLRenderTarget,
	Texture,
	CubeTexture,
	Scene
} from '../../../src/Three';

export class PMREMGenerator {

	constructor( renderer:WebGLRenderer );
	fromScene( scene:Scene, sigma?:number, near?:number, far?:number ): WebGLRenderTarget;
	fromEquirectangular( equirectangular:Texture ): WebGLRenderTarget;
	fromCubemap( cubemap:CubeTexture ): WebGLRenderTarget;
	dispose(): void;

}
