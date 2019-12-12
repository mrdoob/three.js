import { KeyframeTrack } from './../KeyframeTrack';
import { InterpolationModes } from '../../constants';

export class UniformKeyframeTrack extends KeyframeTrack {

	constructor(
		name: string,
		times: any[],
		values: any[],
		uniType: string,
		interpolation?: InterpolationModes
	);

}
