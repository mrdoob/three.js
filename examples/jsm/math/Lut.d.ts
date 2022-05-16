import { Color } from '../../../src/Three';

export class Lut {
    constructor(colormap?: string, numberofcolors?: number);
    lut: Color[];
    map: object[];
    n: number;
    minV: number;
    maxV: number;

    set(value: Lut): this;
    setMin(min: number): this;
    setMax(max: number): this;
    setColorMap(colormap?: string, numberofcolors?: number): this;
    copy(lut: Lut): this;
    getColor(alpha: number): Color;
    addColorMap(colormapName: string, arrayOfColors: number[][]): void;
    createCanvas(): HTMLCanvasElement;
    updateCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement;
}

export interface ColorMapKeywords {
    rainbow: number[][];
    cooltowarm: number[][];
    blackbody: number[][];
    grayscale: number[][];
}
