import {
  Vector3
} from '../../../src/Three';

export interface RandomGenerator {
  random(void): number;
  getSeed(void): number;
  setSeed(seed: number): void;
}

export interface LightningSegment {
  iteration: number;
  pos0: Vector3;
  pos1: Vector3;
  linPos0: Vector3;
  linPos1: Vector3;
  up0: Vector3;
  up1: Vector3;
  radius0: number;
  radius1: number;
  fraction0: number;
  fraction1: number;
  positionVariationFactor: number;
}

export interface LightningSubray {
  seed: number;
  maxIterations: number;
  recursion: number;
  pos0: Vector3;
  pos1: Vector3;
  linPos0: Vector3;
  linPos1: Vector3;
  up0: Vector3;
  up1: Vector3;
  radius0: number;
  radius1: number;
  birthTime: number;
  deathTime: number;
  timeScale: number;
  roughness: number;
  straightness: number;
  propagationTimeFactor: number;
  vanishingTimeFactor: number;
  endPropagationTime: number;
  beginVanishingTime: number;
}

export interface RayParameters {
  sourceOffset: Vector3 | undefined;
  destOffset: Vector3 | undefined;

  timeScale: number | undefined;
  roughness: number | undefined;
  straightness: number | undefined;

  up0: Vector3 | undefined;
  up1: Vector3 | undefined;
  radius0: number | undefined;
  radius1: number | undefined;
  radius0Factor : number | undefined;
  radius1Factor : number | undefined;
  minRadius : number | undefined;

  isEternal: boolean | undefined;
  birthTime: number | undefined;
  deathTime: number | undefined;
  propagationTimeFactor: number | undefined;
  vanishingTimeFactor: number | undefined;
  subrayPeriod: number | undefined;
  subrayDutyCycle: number | undefined;

  maxIterations: number | undefined;
  isStatic: boolean | undefined;
  ramification: number | undefined;
  maxSubrayRecursion: number | undefined;
  recursionProbability: number | undefined;
  generateUVs: boolean | undefined;

  randomGenerator: RandomGenerator | undefined;
  noiseSeed: number | undefined;

  onDecideSubrayCreation?: (segment: LightningSegment, lightningStrike: LightningStrike) => void;
  onSubrayCreation?: (segment: LightningSegment, parentSubray: LightningSubray, childSubray: LightningSubray, lightningStrike: LightningStrike) => void;
}

export class LightningStrike {
  constructor(rayParameters?: RayParameters);
  copyParameters( dest?: RayParameters, source?: RayParameters): RayParameters;

  // Ray states
  static readonly RAY_INITIALIZED: number;
  static readonly RAY_UNBORN: number;
  static readonly RAY_PROPAGATING: number;
  static readonly RAY_STEADY: number;
  static readonly RAY_VANISHING: number;
  static readonly RAY_EXTINGUISHED: number;

  state: number;

  update(time: number): void;

  copy(source: LightningStrike): LightningStrike;
  clone(void): LightningStrike;
}
