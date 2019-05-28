export interface WebGLCapabilitiesParameters {
  precision?: any;
  logarithmicDepthBuffer?: any;
}

export class WebGLCapabilities {

	constructor(
    gl: WebGLRenderingContext,
    extensions: any,
    parameters: WebGLCapabilitiesParameters
  );

  precision: any;
  logarithmicDepthBuffer: any;
  maxTextures: any;
  maxVertexTextures: any;
  maxTextureSize: any;
  maxCubemapSize: any;
  maxAttributes: any;
  maxVertexUniforms: any;
  maxVaryings: any;
  maxFragmentUniforms: any;
  vertexTextures: any;
  floatFragmentTextures: any;
  floatVertexTextures: any;

  getMaxAnisotropy(): number;
  getMaxPrecision( precision: string ): string;

}
