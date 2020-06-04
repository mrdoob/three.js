import {
	Color
} from '../../../src/Three';

export class Lut {

	constructor( colormapName?: string, numberOfColors?: number );
	lut: Color[];
	map: object[];
	n: number;
	minV: number;
	maxV: number;

	set( object: any ): this;
	setMin( min: number ): this;
	setMax( max: number ): this;
	setColorMap( colormapName?: string, numberOfColors?: number ): this;
	copy( lut: Lut ): this;
	getColor( alpha: number ): Color;
	createCanvas(): HTMLCanvasElement;
	updateCanvas( canvas: HTMLCanvasElement ): HTMLCanvasElement;

	/** @deprecated Use static `Lut.AddColorMap()` instead. */
	addColorMap( colormapName: string, arrayOfColorStops: number[][] ): void;
	static AddColorMap( colormapName: string, arrayOfColorStops: number[][] ): void;
	
}

export interface ColorMapKeywords {
	rainbow: number[][];
	cooltowarm: number[][];
	blackbody: number[][];
	grayscale: number[][];
}
