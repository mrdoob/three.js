import {
	CubeTexture,
	LightProbe,
	WebGLRenderer,
	WebGLCubeRenderTarget,
} from '../../../src/Three';

export namespace LightProbeGenerator {

	export function fromCubeTexture( cubeTexture: CubeTexture ): LightProbe;
	export function fromRenderTargetCube( renderer: WebGLRenderer, renderTargetCube: WebGLCubeRenderTarget ): LightProbe;

}
