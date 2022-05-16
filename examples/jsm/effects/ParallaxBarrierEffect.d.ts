import { Camera, Scene, WebGLRenderer } from '../../../src/Three';

export class ParallaxBarrierEffect {
    constructor(renderer: WebGLRenderer);

    render(scene: Scene, camera: Camera): void;
    setSize(width: number, height: number): void;
}
