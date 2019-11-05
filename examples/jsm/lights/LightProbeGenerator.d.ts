import {
	CubeTexture,
	LightProbe,
	WebGLRenderer,
	WebGLRenderTargetCube,
} from '../../../src/Three';

export namespace LightProbeGenerator {

	export function fromCubeTexture(cubeTexture: CubeTexture): LightProbe;
	export function fromRenderTargetCube(renderer: WebGLRenderer, renderTargetCube: WebGLRenderTargetCube): LightProbe;

}
