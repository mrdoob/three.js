import { WebGLExtensions } from './WebGLExtensions.js';
import { WebGLState } from './WebGLState.js';
import { WebGLProperties } from './WebGLProperties.js';
import { WebGLCapabilities } from './WebGLCapabilities.js';
import { WebGLUtils } from './WebGLUtils.js';
import { WebGLInfo } from './WebGLInfo.js';

export class WebGLTextures {

	constructor(
		gl: WebGLRenderingContext,
		extensions: WebGLExtensions,
		state: WebGLState,
		properties: WebGLProperties,
		capabilities: WebGLCapabilities,
		utils: WebGLUtils,
		info: WebGLInfo
	);

	allocateTextureUnit(): void;
	resetTextureUnits(): void;
	setTexture2D( texture: any, slot: number ): void;
	setTexture2DArray( texture: any, slot: number ): void;
	setTexture3D( texture: any, slot: number ): void;
	setTextureCube( texture: any, slot: number ): void;
	setTextureCubeDynamic( texture: any, slot: number ): void;
	setupRenderTarget( renderTarget: any ): void;
	updateRenderTargetMipmap( renderTarget: any ): void;
	updateMultisampleRenderTarget( renderTarget: any ): void;
	safeSetTexture2D( texture: any, slot: number ): void;
	safeSetTextureCube( texture: any, slot: number ): void;

}
