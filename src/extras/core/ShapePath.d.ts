import { Vector2 } from './../../math/Vector2';
import { Shape } from './Shape';

export class ShapePath {

	constructor();

  subPaths: any[];
  currentPath: any;

  moveTo( x: number, y: number ): void;
  lineTo( x: number, y: number ): void;
  quadraticCurveTo( aCPx: number, aCPy: number, aX: number, aY: number ): void;
  bezierCurveTo(
    aCP1x: number,
    aCP1y: number,
    aCP2x: number,
    aCP2y: number,
    aX: number,
    aY: number
  ): void;
  splineThru( pts: Vector2[] ): void;
  toShapes( isCCW: boolean, noHoles: any ): Shape[];

}
