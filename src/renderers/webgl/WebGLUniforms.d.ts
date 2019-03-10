import { WebGLProgram } from './WebGLProgram';
import { WebGLRenderer } from './../WebGLRenderer';
import { WebGLTextures } from './WebGLTextures';

export class WebGLUniforms {
  constructor(gl: any, program: WebGLProgram, renderer: WebGLRenderer, textures: WebGLTextures);

  renderer: WebGLRenderer;

  setValue(gl: any, name: string, value: any): void;
  set(gl: any, object: any, name: string): void;
  setOptional(gl: any, object: any, name: string): void;

  static upload(gl: any, seq: any, values: any[], renderer: WebGLRenderer, textures: WebGLTextures): void;
  static seqWithValue(seq: any, values: any[]): any[];
  static splitDynamic(seq: any, values: any[]): any[];
  static evalDynamic(seq: any, values: any[], object: any, camera: any): any[];
}
