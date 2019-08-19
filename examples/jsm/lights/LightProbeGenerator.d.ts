import {
  CubeTexture,
  LightProbe,
  WebGLRenderer
} from '../../../src/Three';

export namespace LightProbeGenerator {

  export function fromCubeTexture(cubeTexture: CubeTexture): LightProbe;
  export function fromCubeCamera(renderer: WebGLRenderer, cubeCamera: CubeCamera): LightProbe;

}
