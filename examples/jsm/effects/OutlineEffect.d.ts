import {
  Camera,
  Scene,
  Vector2,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget,
  WebGLShadowMap
} from '../../../src/Three';

export interface OutlineEffectParameters {
  defaultThickness?: number;
  defaultColor?: number[];
  defaultAlpha?: number;
  defaultKeepAlive?: boolean;
}

export class OutlineEffect {
  constructor(renderer: WebGLRenderer, parameters: OutlineEffectParameters);
  enabled: boolean;
  autoClear: boolean;
  domElement: HTMLElement;
  shadowMap: WebGLShadowMap;

  clear(color?: boolean, depth?: boolean, stencil?: boolean): void;
  getPixelRatio(): number;
  getSize(target: Vector2): Vector2;
  render(scene: Scene, camera: Camera): void;
  renderOutline(scene: Scene, camera: Camera): void;
  setRenderTarget(renderTarget: WebGLRenderTarget | null): void;
  setPixelRatio(value: number): void;
  setScissor(x: Vector4 | number, y?: number, width?: number, height?: number): void;
  setScissorTest(enable: boolean): void;
  setSize(width: number, height: number, updateStyle?: boolean): void;
  setViewport(x: Vector4 | number, y?: number, width?: number, height?: number): void;
}
