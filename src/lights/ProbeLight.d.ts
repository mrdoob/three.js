import { Color } from './../math/Color';
import { Light } from './Light';

export class ProbeLight extends Light {
  /**
   * This creates a ProbeLight with a set of coefficients.
   * @param coefficients Nine element array of coefficients
   */
  constructor(coefficients?: Array, intensity?: number);

  castShadow: boolean;
}
