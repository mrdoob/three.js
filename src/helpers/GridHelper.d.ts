import { Color } from './../math/Color';
import { LineSegments } from './../objects/LineSegments';

export class GridHelper extends LineSegments {
  constructor(
    size: number,
    divisions: number,
    color1?: Color | number,
    color2?: Color | number
  );
  /**
   * @deprecated Colors should be specified in the constructor.
   */
  setColors(color1?: Color | number, color2?: Color | number): void;
}
