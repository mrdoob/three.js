import { LineSegments } from '../objects/LineSegments';
import { Color } from '../math/Color';

export class PolarGridHelper extends LineSegments {

	constructor(
    radius: number,
    radials: number,
    circles: number,
    divisions: number,
    color1: Color | string | number | undefined,
    color2: Color | string | number | undefined
  );

}
