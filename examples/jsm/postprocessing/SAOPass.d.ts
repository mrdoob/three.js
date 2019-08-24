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

interface SAOPassParams {
  output: SAOPass.OUTPUT;
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

export namespace SAOPass {
  enum OUTPUT {
    Default,
    Beauty,
    SAO,
    Depth,
    Normal
  }
}

export class SAOPass extends Pass {
  constructor(scene: Scene, camera: Camera, depthTexture?: boolean, useNormals?: boolean, resolution?: Vector2);
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

  renderPass(renderer: WebGLRenderer, passMaterial: Material, renderTarget: WebGLRenderTarget, clearColor?: Color, clearAlpha?: number): void;
  renderPass(renderer: WebGLRenderer, passMaterial: Material, renderTarget: WebGLRenderTarget, clearColor?: number, clearAlpha?: number): void;
  renderOverride(renderer: WebGLRenderer, overrideMaterial: Material, renderTarget: WebGLRenderTarget, clearColor?: Color, clearAlpha?: number): void;
  renderOverride(renderer: WebGLRenderer, overrideMaterial: Material, renderTarget: WebGLRenderTarget, clearColor?: number, clearAlpha?: number): void;
}
