import { CullFace } from '../../constants';

export class WebGLColorBuffer {
  constructor(gl: any, state: any);

  setMask(colorMask: number): void;
  setLocked(lock: boolean): void;
  setClear(r: number, g: number, b: number, a: number): void;
  reset(): void;
}

export class WebGLDepthBuffer {
  constructor(gl: any, state: any);

  setTest(depthTest: boolean): void;
  setMask(depthMask: number): void;
  setFunc(depthFunc: number): void;
  setLocked(lock: boolean): void;
  setClear(depth: any): void;
  reset(): void;
}

export class WebGLStencilBuffer {
  constructor(gl: any, state: any);

  setTest(stencilTest: boolean): void;
  setMask(stencilMask: number): void;
  setFunc(stencilFunc: number, stencilRef: any, stencilMask: number): void;
  setOp(stencilFail: any, stencilZFail: any, stencilZPass: any): void;
  setLocked(lock: boolean): void;
  setClear(stencil: any): void;
  reset(): void;
}

export class WebGLState {
  constructor(gl: any, extensions: any, paramThreeToGL: Function);

  buffers: {
    color: WebGLColorBuffer;
    depth: WebGLDepthBuffer;
    stencil: WebGLStencilBuffer;
  };

  init(): void;
  initAttributes(): void;
  enableAttribute(attribute: string): void;
  enableAttributeAndDivisor(
    attribute: string,
    meshPerAttribute: any,
    extension: any
  ): void;
  disableUnusedAttributes(): void;
  enable(id: string): void;
  disable(id: string): void;
  getCompressedTextureFormats(): any[];
  setBlending(
    blending: number,
    blendEquation?: number,
    blendSrc?: number,
    blendDst?: number,
    blendEquationAlpha?: number,
    blendSrcAlpha?: number,
    blendDstAlpha?: number,
    premultiplyAlpha?: boolean
  ): void;
  setColorWrite(colorWrite: number): void;
  setDepthTest(depthTest: number): void;
  setDepthWrite(depthWrite: number): void;
  setDepthFunc(depthFunc: Function): void;
  setStencilTest(stencilTest: boolean): void;
  setStencilWrite(stencilWrite: any): void;
  setStencilFunc(
    stencilFunc: Function,
    stencilRef: any,
    stencilMask: number
  ): void;
  setStencilOp(stencilFail: any, stencilZFail: any, stencilZPass: any): void;
  setFlipSided(flipSided: number): void;
  setCullFace(cullFace: CullFace): void;
  setLineWidth(width: number): void;
  setPolygonOffset(polygonoffset: number, factor: number, units: number): void;
  setScissorTest(scissorTest: boolean): void;
  getScissorTest(): boolean;
  activeTexture(webglSlot: any): void;
  bindTexture(webglType: any, webglTexture: any): void;
  // Same interface as https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/compressedTexImage2D
  compressedTexImage2D(): void;
  // Same interface as https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
  texImage2D(): void;
  clearColor(r: number, g: number, b: number, a: number): void;
  clearDepth(depth: number): void;
  clearStencil(stencil: any): void;
  scissor(scissor: any): void;
  viewport(viewport: any): void;
  reset(): void;
}
