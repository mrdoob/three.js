import { Color } from './../math/Color';

export interface IFog {
	name: string;
	color: Color;
	clone(): this;
	toJSON(): any;
}
