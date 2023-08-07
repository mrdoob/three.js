import { BufferGeometry, ColorRepresentation, Mesh, Texture, TextureEncoding, Vector2 } from '../../../src/Three';

export interface Water2Options {
    color?: ColorRepresentation;
    textureWidth?: number;
    textureHeight?: number;
    clipBias?: number;
    flowDirection?: Vector2;
    flowSpeed?: number;
    reflectivity?: number;
    scale?: number;
    shader?: object;
    flowMap?: Texture;
    normalMap0?: Texture;
    normalMap1?: Texture;
    encoding?: TextureEncoding;
}

export class Water extends Mesh {
    constructor(geometry: BufferGeometry, options: Water2Options);
}
