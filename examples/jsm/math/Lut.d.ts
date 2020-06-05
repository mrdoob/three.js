import {
	Color
} from '../../../src/Three';

type ColorStop = [ number, Color | number | string ];
type MapName = 'rainbow' | 'cooltowarm' | 'blackbody' | 'grayscale';

export class Lut {

	constructor( map?: MapName | ColorStop[], numberOfColors?: number );
	colors: Color[];
	map: ColorStop[];
	minV: number;
	maxV: number;

	setMin( min: number ): this;
	setMax( max: number ): this;
	setColorMap( map?: MapName | ColorStop[], numberOfColors?: number ): this;
	copy( lut: Lut ): this;
	getColor( alpha: number ): Color;
	createCanvas(): HTMLCanvasElement;
	updateCanvas( canvas: HTMLCanvasElement ): HTMLCanvasElement;

}
