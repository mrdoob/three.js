import { Light, Renderer } from '../../../src/Three';

export interface Size {
    width: number;
    height: number;
    set: (width: number, height: number) => void;
}

export interface Position {
    x: number;
    y: number;
    set: (x: number, y: number) => void;
}

export class ShadowMapViewer {
    constructor(light: Light);

    enabled: boolean;
    size: Size;
    position: Position;
    render(renderer: Renderer): void;
    updateForWindowResize(): void;
    update(): void;
}
