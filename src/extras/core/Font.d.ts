import { Shape } from './Shape';

export class Font {

	constructor( jsondata: any );

	/**
	 * @default 'Font'
	 */
	type: string;

	data: string;

	generateShapes( text: string, size: number ): Shape[];

}
