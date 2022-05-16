import { WebGLRenderer } from '../WebGLRenderer';

export class WebGLCubeMaps {
    constructor(renderer: WebGLRenderer);

    get(texture: any): any;
    dispose(): void;
}
