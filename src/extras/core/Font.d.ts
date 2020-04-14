import { Shape } from './Shape';

export class Font {

	constructor( jsondata: any );

	data: string;

	generateShapes( text: string, size: number ): Shape[];

}
