import { DiscreteInterpolant } from './../math/interpolants/DiscreteInterpolant';
import { LinearInterpolant } from './../math/interpolants/LinearInterpolant';
import { CubicInterpolant } from './../math/interpolants/CubicInterpolant';
import { InterpolationModes } from '../constants';

export class KeyframeTrack {
  constructor(
    name: string,
    times: any[],
    values: any[],
    interpolation?: InterpolationModes
  );

  name: string;
  times: any[];
  values: any[];

  ValueTypeName: string;
  TimeBufferType: Float32Array;
  ValueBufferType: Float32Array;

  DefaultInterpolation: InterpolationModes;

  InterpolantFactoryMethodDiscrete(result: any): DiscreteInterpolant;
  InterpolantFactoryMethodLinear(result: any): LinearInterpolant;
  InterpolantFactoryMethodSmooth(result: any): CubicInterpolant;

  setInterpolation(interpolation: InterpolationModes): void;
  getInterpolation(): InterpolationModes;

  getValuesize(): number;

  shift(timeOffset: number): KeyframeTrack;
  scale(timeScale: number): KeyframeTrack;
  trim(startTime: number, endTime: number): KeyframeTrack;
  validate(): boolean;
  optimize(): KeyframeTrack;

  static parse(json: any): KeyframeTrack;
  static toJSON(track: KeyframeTrack): any;
}
