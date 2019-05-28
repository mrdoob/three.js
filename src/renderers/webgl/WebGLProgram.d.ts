import { WebGLRenderer, WebGLRendererParameters } from './../WebGLRenderer';
import { ShaderMaterial } from './../../materials/ShaderMaterial';
import { WebGLShader } from './WebGLShader';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLTextures } from './WebGLTextures';
import { WebGLUniforms } from './WebGLUniforms';

export class WebGLProgram {

	constructor(
    renderer: WebGLRenderer,
    extensions: WebGLExtensions,
    code: string,
    material: ShaderMaterial,
    shader: WebGLShader,
    parameters: WebGLRendererParameters,
    capabilities: WebGLCapabilities,
    textures: WebGLTextures
  );

  id: number;
  code: string;
  usedTimes: number;
  program: any;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  /**
   * @deprecated Use {@link WebGLProgram#getUniforms getUniforms()} instead.
   */
  uniforms: any;
  /**
   * @deprecated Use {@link WebGLProgram#getAttributes getAttributes()} instead.
   */
  attributes: any;

  getUniforms(): WebGLUniforms;
  getAttributes(): any;
  destroy(): void;

}
