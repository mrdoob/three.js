import { Vector4 } from './../math/Vector4';
import { Texture } from './../textures/Texture';
import { EventDispatcher } from './../core/EventDispatcher';
import { Wrapping, TextureFilter, TextureDataType } from '../constants';

export interface WebGLRenderTargetOptions {
  wrapS?: Wrapping;
  wrapT?: Wrapping;
  magFilter?: TextureFilter;
  minFilter?: TextureFilter;
  format?: number; // RGBAFormat;
  type?: TextureDataType; // UnsignedByteType;
  anisotropy?: number; // 1;
  depthBuffer?: boolean; // true;
  stencilBuffer?: boolean; // true;
  generateMipmaps?: boolean; // true;
}

export class WebGLRenderTarget extends EventDispatcher {

	constructor(
    width: number,
    height: number,
    options?: WebGLRenderTargetOptions
  );

  uuid: string;
  width: number;
  height: number;
  scissor: Vector4;
  scissorTest: boolean;
  viewport: Vector4;
  texture: Texture;
  depthBuffer: boolean;
  stencilBuffer: boolean;
  depthTexture: Texture;
  /**
   * @deprecated Use {@link Texture#wrapS texture.wrapS} instead.
   */
  wrapS: any;
  /**
   * @deprecated Use {@link Texture#wrapT texture.wrapT} instead.
   */
  wrapT: any;
  /**
   * @deprecated Use {@link Texture#magFilter texture.magFilter} instead.
   */
  magFilter: any;
  /**
   * @deprecated Use {@link Texture#minFilter texture.minFilter} instead.
   */
  minFilter: any;
  /**
   * @deprecated Use {@link Texture#anisotropy texture.anisotropy} instead.
   */
  anisotropy: any;
  /**
   * @deprecated Use {@link Texture#offset texture.offset} instead.
   */
  offset: any;
  /**
   * @deprecated Use {@link Texture#repeat texture.repeat} instead.
   */
  repeat: any;
  /**
   * @deprecated Use {@link Texture#format texture.format} instead.
   */
  format: any;
  /**
   * @deprecated Use {@link Texture#type texture.type} instead.
   */
  type: any;
  /**
   * @deprecated Use {@link Texture#generateMipmaps texture.generateMipmaps} instead.
   */
  generateMipmaps: any;

  setSize( width: number, height: number ): void;
  clone(): this;
  copy( source: WebGLRenderTarget ): this;
  dispose(): void;

}
