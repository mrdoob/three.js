import { PositionalAudio } from './../audio/PositionalAudio';
import { Line } from './../objects/Line';

export class PositionalAudioHelper extends Line {
  constructor(audio: PositionalAudio, range?: number, divisionsInnerAngle?: number, divisionsOuterAngle?: number);

  audio: PositionalAudio;
  range: number;
  divisionsInnerAngle: number;
  divisionsOuterAngle: number;

  dispose(): void;
  update(): void;
}
