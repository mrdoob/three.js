import { Scene } from './../scenes/Scene';
import { Camera } from './../cameras/Camera';
import { WebGLExtensions } from './webgl/WebGLExtensions';
import { WebGLInfo } from './webgl/WebGLInfo';
import { WebGLShadowMap } from './webgl/WebGLShadowMap';
import { WebGLCapabilities } from './webgl/WebGLCapabilities';
import { WebGLProperties } from './webgl/WebGLProperties';
import { WebGLRenderLists } from './webgl/WebGLRenderLists';
import { WebGLState } from './webgl/WebGLState';
import { Vector2 } from './../math/Vector2';
import { Vector4 } from './../math/Vector4';
import { Color } from './../math/Color';
import { WebGLRenderTarget } from './WebGLRenderTarget';
import { Object3D } from './../core/Object3D';
import { Material } from './../materials/Material';
import { Fog } from './../scenes/Fog';
import { Texture } from './../textures/Texture';
import { ToneMapping, ShadowMapType, CullFace } from '../constants';
import { WebVRManager } from '../renderers/webvr/WebVRManager';
import { RenderTarget } from './webgl/WebGLRenderLists';

export interface Renderer {
  domElement: HTMLCanvasElement;

  render(scene: Scene, camera: Camera): void;
  setSize(width: number, height: number, updateStyle?: boolean): void;
}

export interface WebGLRendererParameters {
  /**
   * A Canvas where the renderer draws its output.
   */
  canvas?: HTMLCanvasElement;

  /**
   * A WebGL Rendering Context.
   * (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
   *  Default is null
   */
  context?: WebGLRenderingContext;

  /**
   *  shader precision. Can be "highp", "mediump" or "lowp".
   */
  precision?: string;

  /**
   * default is true.
   */
  alpha?: boolean;

  /**
   * default is true.
   */
  premultipliedAlpha?: boolean;

  /**
   * default is false.
   */
  antialias?: boolean;

  /**
   * default is true.
   */
  stencil?: boolean;

  /**
   * default is false.
   */
  preserveDrawingBuffer?: boolean;

  /**
   *  Can be "high-performance", "low-power" or "default"
   */
  powerPreference?: string;

  /**
   * default is true.
   */
  depth?: boolean;

  /**
   * default is false.
   */
  logarithmicDepthBuffer?: boolean;
}

/**
 * The WebGL renderer displays your beautifully crafted scenes using WebGL, if your device supports it.
 * This renderer has way better performance than CanvasRenderer.
 *
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/renderers/WebGLRenderer.js">src/renderers/WebGLRenderer.js</a>
 */
export class WebGLRenderer implements Renderer {
  /**
   * parameters is an optional object with properties defining the renderer's behaviour. The constructor also accepts no parameters at all. In all cases, it will assume sane defaults when parameters are missing.
   */
  constructor(parameters?: WebGLRendererParameters);

  /**
   * A Canvas where the renderer draws its output.
   * This is automatically created by the renderer in the constructor (if not provided already); you just need to add it to your page.
   */
  domElement: HTMLCanvasElement;

  /**
   * The HTML5 Canvas's 'webgl' context obtained from the canvas where the renderer will draw.
   */
  context: WebGLRenderingContext;

  /**
   * Defines whether the renderer should automatically clear its output before rendering.
   */
  autoClear: boolean;

  /**
   * If autoClear is true, defines whether the renderer should clear the color buffer. Default is true.
   */
  autoClearColor: boolean;

  /**
   * If autoClear is true, defines whether the renderer should clear the depth buffer. Default is true.
   */
  autoClearDepth: boolean;

  /**
   * If autoClear is true, defines whether the renderer should clear the stencil buffer. Default is true.
   */
  autoClearStencil: boolean;

  /**
   * Defines whether the renderer should sort objects. Default is true.
   */
  sortObjects: boolean;

  clippingPlanes: any[];
  localClippingEnabled: boolean;

  extensions: WebGLExtensions;

  /**
   * Default is false.
   */
  gammaInput: boolean;

  /**
   * Default is false.
   */
  gammaOutput: boolean;

  physicallyCorrectLights: boolean;
  toneMapping: ToneMapping;
  toneMappingExposure: number;
  toneMappingWhitePoint: number;

  /**
   * Default is false.
   */
  shadowMapDebug: boolean;

  /**
   * Default is 8.
   */
  maxMorphTargets: number;

  /**
   * Default is 4.
   */
  maxMorphNormals: number;

  info: WebGLInfo;

  shadowMap: WebGLShadowMap;

  pixelRation: number;

  capabilities: WebGLCapabilities;
  properties: WebGLProperties;
  renderLists: WebGLRenderLists;
  state: WebGLState;

  vr: WebVRManager;

  /**
   * Return the WebGL context.
   */
  getContext(): WebGLRenderingContext;
  getContextAttributes(): any;
  forceContextLoss(): void;

  /**
   * @deprecated Use {@link WebGLCapabilities#getMaxAnisotropy .capabilities.getMaxAnisotropy()} instead.
   */
  getMaxAnisotropy(): number;

  /**
   * @deprecated Use {@link WebGLCapabilities#precision .capabilities.precision} instead.
   */
  getPrecision(): string;

  getPixelRatio(): number;
  setPixelRatio(value: number): void;

  getDrawingBufferSize(): { width: number; height: number };
  setDrawingBufferSize(width: number, height: number, pixelRatio: number): void;

  getSize(target: Vector2): Vector2;

  /**
   * Resizes the output canvas to (width, height), and also sets the viewport to fit that size, starting in (0, 0).
   */
  setSize(width: number, height: number, updateStyle?: boolean): void;

  getCurrentViewport(target: Vector4): Vector4;

  /**
   * Copies the viewport into target.
   */
  getViewport(target: Vector4): Vector4;

  /**
   * Sets the viewport to render from (x, y) to (x + width, y + height).
   * (x, y) is the lower-left corner of the region.
   */
  setViewport(x: Vector4 | number, y?: number, width?: number, height?: number): void;

  /**
   * Copies the scissor area into target.
   */
  getScissor(target: Vector4): Vector4;

  /**
   * Sets the scissor area from (x, y) to (x + width, y + height).
   */
  setScissor(x: Vector4 | number, y?: number, width?: number, height?: number): void;

  /**
   * Returns true if scissor test is enabled; returns false otherwise.
   */
  getScissorTest(): boolean;

  /**
   * Enable the scissor test. When this is enabled, only the pixels within the defined scissor area will be affected by further renderer actions.
   */
  setScissorTest(enable: boolean): void;

  /**
   * Returns a THREE.Color instance with the current clear color.
   */
  getClearColor(): Color;

  /**
   * Sets the clear color, using color for the color and alpha for the opacity.
   */
  setClearColor(color: Color, alpha?: number): void;
  setClearColor(color: string, alpha?: number): void;
  setClearColor(color: number, alpha?: number): void;

  /**
   * Returns a float with the current clear alpha. Ranges from 0 to 1.
   */
  getClearAlpha(): number;

  setClearAlpha(alpha: number): void;

  /**
   * Tells the renderer to clear its color, depth or stencil drawing buffer(s).
   * Arguments default to true
   */
  clear(color?: boolean, depth?: boolean, stencil?: boolean): void;

  clearColor(): void;
  clearDepth(): void;
  clearStencil(): void;
  clearTarget(
    renderTarget: WebGLRenderTarget,
    color: boolean,
    depth: boolean,
    stencil: boolean
  ): void;

  /**
   * @deprecated Use {@link WebGLState#reset .state.reset()} instead.
   */
  resetGLState(): void;
  dispose(): void;

  /**
   * Tells the shadow map plugin to update using the passed scene and camera parameters.
   *
   * @param scene an instance of Scene
   * @param camera — an instance of Camera
   */
  renderBufferImmediate(
    object: Object3D,
    program: Object,
    material: Material
  ): void;

  renderBufferDirect(
    camera: Camera,
    fog: Fog,
    material: Material,
    geometryGroup: any,
    object: Object3D
  ): void;

  /**
   * A build in function that can be used instead of requestAnimationFrame. For WebVR projects this function must be used.
   * @param callback The function will be called every available frame. If `null` is passed it will stop any already ongoing animation.
   */
  setAnimationLoop(callback: Function): void;

  /**
   * @deprecated Use {@link WebGLRenderer#setAnimationLoop .setAnimationLoop()} instead.
   */
  animate(callback: Function): void;

  /**
   * Render a scene using a camera.
   * The render is done to a previously specified {@link WebGLRenderTarget#renderTarget .renderTarget} set by calling
   * {@link WebGLRenderer#setRenderTarget .setRenderTarget} or to the canvas as usual.
   *
   * By default render buffers are cleared before rendering but you can prevent this by setting the property
   * {@link WebGLRenderer#autoClear autoClear} to false. If you want to prevent only certain buffers being cleared
   * you can set either the {@link WebGLRenderer#autoClearColor autoClearColor},
   * {@link WebGLRenderer#autoClearStencil autoClearStencil} or {@link WebGLRenderer#autoClearDepth autoClearDepth}
   * properties to false. To forcibly clear one ore more buffers call {@link WebGLRenderer#clear .clear}.
   */
  render(
    scene: Scene,
    camera: Camera
  ): void;

  /**
   * Returns the current render target. If no render target is set, null is returned.
   */
  getRenderTarget(): RenderTarget | null;

  /**
   * @deprecated Use {@link WebGLRenderer#getRenderTarget .getRenderTarget()} instead.
   */
  getCurrentRenderTarget(): RenderTarget | null;

  /**
   * Sets the active render target.
   *
   * @param renderTarget The {@link WebGLRenderTarget renderTarget} that needs to be activated. When `null` is given, the canvas is set as the active render target instead.
	 * @param activeCubeFace Specifies the active cube side (PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5) of {@link WebGLRenderTargetCube}.
	 * @param activeMipMapLevel Specifies the active mipmap level.
   */
  setRenderTarget(renderTarget: RenderTarget | null, activeCubeFace?: number, activeMipMapLevel?: number): void;

  readRenderTargetPixels(
    renderTarget: RenderTarget,
    x: number,
    y: number,
    width: number,
    height: number,
    buffer: any
  ): void;

  /**
   * @deprecated
   */
  gammaFactor: number;

  /**
   * @deprecated Use {@link WebGLShadowMap#enabled .shadowMap.enabled} instead.
   */
  shadowMapEnabled: boolean;

  /**
   * @deprecated Use {@link WebGLShadowMap#type .shadowMap.type} instead.
   */
  shadowMapType: ShadowMapType;

  /**
   * @deprecated Use {@link WebGLShadowMap#cullFace .shadowMap.cullFace} instead.
   */
  shadowMapCullFace: CullFace;

  /**
   * @deprecated Use {@link WebGLExtensions#get .extensions.get( 'OES_texture_float' )} instead.
   */
  supportsFloatTextures(): any;

  /**
   * @deprecated Use {@link WebGLExtensions#get .extensions.get( 'OES_texture_half_float' )} instead.
   */
  supportsHalfFloatTextures(): any;

  /**
   * @deprecated Use {@link WebGLExtensions#get .extensions.get( 'OES_standard_derivatives' )} instead.
   */
  supportsStandardDerivatives(): any;

  /**
   * @deprecated Use {@link WebGLExtensions#get .extensions.get( 'WEBGL_compressed_texture_s3tc' )} instead.
   */
  supportsCompressedTextureS3TC(): any;

  /**
   * @deprecated Use {@link WebGLExtensions#get .extensions.get( 'WEBGL_compressed_texture_pvrtc' )} instead.
   */
  supportsCompressedTexturePVRTC(): any;

  /**
   * @deprecated Use {@link WebGLExtensions#get .extensions.get( 'EXT_blend_minmax' )} instead.
   */
  supportsBlendMinMax(): any;

  /**
   * @deprecated Use {@link WebGLCapabilities#vertexTextures .capabilities.vertexTextures} instead.
   */
  supportsVertexTextures(): any;

  /**
   * @deprecated Use {@link WebGLExtensions#get .extensions.get( 'ANGLE_instanced_arrays' )} instead.
   */
  supportsInstancedArrays(): any;

  /**
   * @deprecated Use {@link WebGLRenderer#setScissorTest .setScissorTest()} instead.
   */
  enableScissorTest(boolean: any): any;
}
