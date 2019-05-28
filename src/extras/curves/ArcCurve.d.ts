import { EllipseCurve } from './EllipseCurve';
export class ArcCurve extends EllipseCurve {

	constructor(
    aX: number,
    aY: number,
    aRadius: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean
  );

}
