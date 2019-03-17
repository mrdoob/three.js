import { KeyframeTrack } from './../KeyframeTrack';
import { InterpolationModes } from '../../constants';

export class StringKeyframeTrack extends KeyframeTrack {
  constructor(
    name: string,
    times: any[],
    values: any[],
    interpolation?: InterpolationModes
  );
}
