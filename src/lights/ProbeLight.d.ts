import { Color } from './../math/Color';
import { Light } from './Light';

export class ProbeLight extends Light {
  /**
   * This creates a ProbeLight with a color.
   * @param color Numeric value of the RGB component of the color or a Color instance.
   */
  constructor(color?: Color | string | number, intensity?: number);

  castShadow: boolean;
}
