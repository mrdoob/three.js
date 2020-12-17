import { KeyframeTrack } from './../KeyframeTrack';
import { InterpolationModes } from '../../constants';

export class QuaternionKeyframeTrack extends KeyframeTrack {

	constructor(
		name: string,
		times: any[],
		values: any[],
		interpolation?: InterpolationModes
	);

	/**
	 * @default 'quaternion'
	 */
	ValueTypeName: string;

}
