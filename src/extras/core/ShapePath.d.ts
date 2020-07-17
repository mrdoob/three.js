import { Vector2 } from './../../math/Vector2';
import { Shape } from './Shape';

export class ShapePath {

	constructor();

	subPaths: any[];
	currentPath: any;

	moveTo( x: number, y: number ): this;
	lineTo( x: number, y: number ): this;
	quadraticCurveTo( aCPx: number, aCPy: number, aX: number, aY: number ): this;
	bezierCurveTo(
		aCP1x: number,
		aCP1y: number,
		aCP2x: number,
		aCP2y: number,
		aX: number,
		aY: number
	): this;
	splineThru( pts: Vector2[] ): this;
	toShapes( isCCW: boolean, noHoles?: boolean ): Shape[];

}
