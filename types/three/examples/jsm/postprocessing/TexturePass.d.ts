import { Texture, ShaderMaterial } from '../../../src/Three';

import { Pass } from './Pass';

export class TexturePass extends Pass {
    constructor(map: Texture, opacity?: number);
    map: Texture;
    opacity: number;
    uniforms: object;
    material: ShaderMaterial;
    fsQuad: object;
}
