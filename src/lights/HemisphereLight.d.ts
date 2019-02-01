import { Color } from './../math/Color';
import { Light } from './Light';

export class HemisphereLight extends Light {
  constructor(
    skyColor?: Color | string | number,
    groundColor?: Color | string | number,
    intensity?: number
  );

  skyColor: Color;
  groundColor: Color;
  intensity: number;
}
