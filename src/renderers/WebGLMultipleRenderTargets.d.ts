import { EventDispatcher } from '../core/EventDispatcher';
import { Texture } from '../textures/Texture';

/**
 * This class originall extended WebGLMultipleRenderTarget
 * However, there are some issues with this method as documented below
 */
export class WebGLMultipleRenderTargets extends EventDispatcher {
    texture: Texture[];

    readonly isWebGLMultipleRenderTargets = true;

    constructor(width: number, height: number, count: number);

    setSize(width: number, height: number, depth?: number): this;
    copy(source: WebGLMultipleRenderTargets): this;
    clone(): this;
    dispose(): void;
    // This is an available method, however it will break the code see https://github.com/mrdoob/three.js/issues/21930
    setTexture(texture: Texture): void;
}
