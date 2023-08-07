import { KeyframeTrack } from './../KeyframeTrack';
import { InterpolationModes } from '../../constants';

export class VectorKeyframeTrack extends KeyframeTrack {
    constructor(name: string, times: any[], values: any[], interpolation?: InterpolationModes);

    /**
     * @default 'vector'
     */
    ValueTypeName: string;
}
