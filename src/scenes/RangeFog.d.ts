import { Color } from './../math/Color';
import { IFog } from './IFog';

/**
 * This class contains the parameters that define smooth ranged fog, i.e., that grows smoothly denser from the near to the far distance.
 */
export class RangeFog implements IFog {

	constructor( hex: number, near?: number, far?: number );

	name: string;

	/**
	 * Fog color.
	 */
	color: Color;

	/**
	 * The minimum distance to start applying fog. Objects that are less than 'near' units from the active camera won't be affected by fog.
	 */
	near: number;

	/**
	 * The maximum distance at which fog stops being calculated and applied. Objects that are more than 'far' units away from the active camera won't be affected by fog.
	 * Default is 1000.
	 */
	far: number;

	readonly isRangeFog: true;

	clone(): this;
	toJSON(): any;

}
