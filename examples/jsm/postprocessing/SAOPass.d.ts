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

  static OUTPUT: {
    Default: number;
    Beauty: number;
    SAO: number;
    Depth: number;
    Normal: number;
  };

  renderPass(renderer: WebGLRenderer, passMaterial: Material, renderTarget: WebGLRenderer, clearColor: Color, clearAlpha: number): void;
  renderOverride(renderer: WebGLRenderer, overrideMaterial: Material, renderTarget: WebGLRenderer, clearColor: Color, clearAlpha: number): void;
}
