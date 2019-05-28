export class WebGLTextures {

	constructor(
    gl: any,
    extensions: any,
    state: any,
    properties: any,
    capabilities: any,
    paramThreeToGL: Function,
    info: any
  );

	setTexture2D( texture: any, slot: number ): void;
	setTextureCube( texture: any, slot: number ): void;
	setTextureCubeDynamic( texture: any, slot: number ): void;
	setupRenderTarget( renderTarget: any ): void;
	updateRenderTargetMipmap( renderTarget: any ): void;

}
