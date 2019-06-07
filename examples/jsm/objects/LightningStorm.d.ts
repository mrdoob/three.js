import {
  Material,
  Vector3
} from '../../../src/Three';

export interface StormParams {
  size: number | undefined;
  minHeight: number | undefined;
  maxHeight: number | undefined;
  maxSlope: number | undefined;

  maxLightnings: number | undefined;

  lightningMinPeriod: number | undefined;
  lightningMaxPeriod: number | undefined;
  lightningMinDuration: number | undefined;
  lightningMaxDuration: number | undefined;

  lightningParameters: RayParameters | undefined;
  lightningMaterial: Material | undefined;

  isEternal: boolean | undefined;

  onRayPosition?: (source: Vector3, dest: Vector3) => void;
  onLightningDown?: (lightning: LightningStrike) => void;
}

export class LightningStorm {
  constructor(stormParams?: StormParams);
  update(time: number): void;
  copy(source: LightningStorm): LightningStorm;
  clone(void): LightningStorm;
}
