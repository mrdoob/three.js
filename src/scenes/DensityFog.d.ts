import { Color } from './../math/Color';
import { IFog } from './IFog';
/**
 * This class contains the parameters that define density-based fog.
 */
export class DensityFog implements IFog {

	constructor( hex: number | string, density?: number, squared?: boolean );

	name: string;
	color: Color;

	/**
	 * Defines how fast the fog will grow dense.
	 * Default is 0.00025.
	 */
	density: number;

	/**
	 * If false, the mode will be exponential fog, which is analogous to physical fog. If true, the mode will be exponential squared fog, which gives a clear view near the camera and a faster than exponentially densening fog farther from the camera.
	 * Default is true, that is exponential squared fog.
	 */
	squared: boolean;

	clone(): this;
	toJSON(): any;

}
