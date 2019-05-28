import { Color } from './../math/Color';
import { Object3D } from './../core/Object3D';
import { SpotLightShadow } from './SpotLightShadow';
import { Light } from './Light';

/**
 * A point light that can cast shadow in one direction.
 */
export class SpotLight extends Light {

	constructor(
    color?: Color | string | number,
    intensity?: number,
    distance?: number,
    angle?: number,
    exponent?: number,
    decay?: number
  );

  /**
   * Spotlight focus points at target.position.
   * Default position — (0,0,0).
   */
  target: Object3D;

  /**
   * Light's intensity.
   * Default — 1.0.
   */
  intensity: number;

  /**
   * If non-zero, light will attenuate linearly from maximum intensity at light position down to zero at distance.
   * Default — 0.0.
   */
  distance: number;

  /*
   * Maximum extent of the spotlight, in radians, from its direction.
   * Default — Math.PI/2.
   */
  angle: number;

  /**
   * Rapidity of the falloff of light from its target direction.
   * Default — 10.0.
   */
  exponent: number;

  decay: number;
  shadow: SpotLightShadow;
  power: number;
  penumbra: number;

}
