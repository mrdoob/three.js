import { WebGLRenderer, WebGLRendererParameters } from './../WebGLRenderer';
import { ShaderMaterial } from './../../materials/ShaderMaterial';
import { WebGLShader } from './WebGLShader';
import { WebGLUniforms } from './WebGLUniforms';

export class WebGLProgram {
  constructor(
    renderer: WebGLRenderer,
    code: string,
    material: ShaderMaterial,
    parameters: WebGLRendererParameters
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
