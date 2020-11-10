import { KeyframeTrack } from './../KeyframeTrack';
import { InterpolationModes } from '../../constants';

export class ColorKeyframeTrack extends KeyframeTrack {

	constructor(
		name: string,
		times: any[],
		values: any[],
		interpolation?: InterpolationModes
	);

	/**
	 * @default 'color'
	 */
	ValueTypeName: string;

}
