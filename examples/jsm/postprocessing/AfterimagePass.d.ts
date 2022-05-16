import { WebGLRenderTarget, ShaderMaterial } from '../../../src/Three';

import { Pass } from './Pass';

export class AfterimagePass extends Pass {
    constructor(damp?: number);
    shader: object;
    uniforms: object;
    textureComp: WebGLRenderTarget;
    textureOld: WebGLRenderTarget;
    shaderMaterial: ShaderMaterial;
    compFsQuad: object;
    copyFsQuad: object;
}
