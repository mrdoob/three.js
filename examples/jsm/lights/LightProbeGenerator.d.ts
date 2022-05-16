import { CubeTexture, LightProbe, WebGLRenderer, WebGLCubeRenderTarget } from '../../../src/Three';

export namespace LightProbeGenerator {
    function fromCubeTexture(cubeTexture: CubeTexture): LightProbe;
    function fromCubeRenderTarget(renderer: WebGLRenderer, cubeRenderTarget: WebGLCubeRenderTarget): LightProbe;
}
