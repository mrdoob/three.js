import { Object3D, Scene, Camera } from '../../../src/Three';

export class CSS3DObject extends Object3D {
    constructor(element: HTMLElement);
    element: HTMLElement;

    onBeforeRender: (renderer: unknown, scene: Scene, camera: Camera) => void;
    onAfterRender: (renderer: unknown, scene: Scene, camera: Camera) => void;
}

export class CSS3DSprite extends CSS3DObject {
    constructor(element: HTMLElement);
}

export class CSS3DRenderer {
    constructor();
    domElement: HTMLElement;

    getSize(): { width: number; height: number };
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: Camera): void;
}
