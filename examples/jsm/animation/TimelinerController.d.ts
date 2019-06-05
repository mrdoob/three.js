import {
  AnimationClip,
  Scene,
  Vector3
} from '../../../src/Three';

export class TimelinerController  {
  constructor(scene: Scene, trackInfo: object[], onUpdate: () => void);

  delKeyframe(channelName: string, time: number): void;
  deserialize(structs: object): void;
  getChannelKeyTimes(): number[];
  getChannelNames(): string[];
  init(): void;
  moveKeyframe(channelName: string, time: number, delta: number, moveRemaining: boolean): void;
  serialize(): object;
  setDisplayTime(time: number): void;
  setDuration(duration: number): void;
  setKeyframe(channelName: string, time: number): void;
}
