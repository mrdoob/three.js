import {
	Scene,
	Camera,
	Material,
	MeshDepthMaterial,
	MeshNormalMaterial,
	ShaderMaterial,
	Color,
	Vector2,
	WebGLRenderer,
	WebGLRenderTarget
} from '../../../src/Three';

import { Pass } from './Pass';

export enum OUTPUT {
	Beauty,
	Default,
	SAO,
	Depth,
	Normal
}

interface SAOPassParams {
	output: OUTPUT;
	saoBias: number;
	saoIntensity: number;
	saoScale: number;
	saoKernelRadius: number;
	saoMinResolution: number;
	saoBlur: number;
	saoBlurRadius: number;
	saoBlurStdDev: number;
	saoBlurDepthCutoff: number;
}

export class SAOPass extends Pass {

	constructor( scene: Scene, camera: Camera, depthTexture?: boolean, useNormals?: boolean, resolution?: Vector2 );
	scene: Scene;
	camera: Camera;
	supportsDepthTextureExtension: boolean;
	supportsNormalTexture: boolean;
	originalClearColor: Color;
	oldClearColor: Color;
	oldClearAlpha: number;
	resolution: Vector2;
	saoRenderTarget: WebGLRenderTarget;
	blurIntermediateRenderTarget: WebGLRenderTarget;
	beautyRenderTarget: WebGLRenderTarget;
	normalRenderTarget: WebGLRenderTarget;
	depthRenderTarget: WebGLRenderTarget;
	depthMaterial: MeshDepthMaterial;
	normalMaterial: MeshNormalMaterial;
	saoMaterial: ShaderMaterial;
	vBlurMaterial: ShaderMaterial;
	hBlurMaterial: ShaderMaterial;
	materialCopy: ShaderMaterial;
	depthCopy: ShaderMaterial;
	fsQuad: object;
	params: SAOPassParams;

	static OUTPUT: OUTPUT;

	renderPass( renderer: WebGLRenderer, passMaterial: Material, renderTarget: WebGLRenderTarget, clearColor?: Color | string | number, clearAlpha?: number ): void;
	renderOverride( renderer: WebGLRenderer, overrideMaterial: Material, renderTarget: WebGLRenderTarget, clearColor?: Color | string | number, clearAlpha?: number ): void;

}
