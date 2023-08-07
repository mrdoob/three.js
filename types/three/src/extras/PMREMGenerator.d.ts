import { WebGLRenderer } from '../renderers/WebGLRenderer';
import { WebGLRenderTarget } from '../renderers/WebGLRenderTarget';
import { Texture } from '../textures/Texture';
import { CubeTexture } from '../textures/CubeTexture';
import { Scene } from '../scenes/Scene';

export class PMREMGenerator {
    constructor(renderer: WebGLRenderer);
    fromScene(scene: Scene, sigma?: number, near?: number, far?: number): WebGLRenderTarget;
    fromEquirectangular(equirectangular: Texture): WebGLRenderTarget;
    fromCubemap(cubemap: CubeTexture): WebGLRenderTarget;
    compileCubemapShader(): void;
    compileEquirectangularShader(): void;
    dispose(): void;
}
