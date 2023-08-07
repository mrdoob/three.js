import { Matrix3, Mesh } from '../../../src/Three';

import { Volume } from './Volume';

export class VolumeSlice {
    constructor(volume: Volume, index?: number, axis?: string);

    index: number;
    axis: string;

    canvas: HTMLCanvasElement;
    canvasBuffer: HTMLCanvasElement;

    ctx: CanvasRenderingContext2D;
    ctxBuffer: CanvasRenderingContext2D;

    mesh: Mesh;

    geometryNeedsUpdate: boolean;

    sliceAccess: number;
    jLength: number;
    iLength: number;
    matrix: Matrix3;

    repaint(): void;
    updateGeometry(): void;
}
