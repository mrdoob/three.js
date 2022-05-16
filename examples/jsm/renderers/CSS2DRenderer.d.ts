import { Object3D, Scene, Camera } from '../../../src/Three';

export class CSS2DObject extends Object3D {
    constructor(element: HTMLElement);
    element: HTMLElement;

    onBeforeRender: (renderer: unknown, scene: Scene, camera: Camera) => void;
    onAfterRender: (renderer: unknown, scene: Scene, camera: Camera) => void;
}

export type CSS2DParameters = {
    element?: HTMLElement;
};

export class CSS2DRenderer {
    constructor(parameters?: CSS2DParameters);
    domElement: HTMLElement;

    getSize(): { width: number; height: number };
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: Camera): void;
}
