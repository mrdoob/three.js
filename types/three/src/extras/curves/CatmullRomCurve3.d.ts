import { Vector3 } from './../../math/Vector3';
import { Curve } from './../core/Curve';

// Extras / Curves /////////////////////////////////////////////////////////////////////
export namespace CurveUtils {
    function tangentQuadraticBezier(t: number, p0: number, p1: number, p2: number): number;
    function tangentCubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number;
    function tangentSpline(t: number, p0: number, p1: number, p2: number, p3: number): number;
    function interpolate(p0: number, p1: number, p2: number, p3: number, t: number): number;
}

export class CatmullRomCurve3 extends Curve<Vector3> {
    /**
     * @param [points=[]]
     * @param [closed=false]
     * @param [curveType='centripetal']
     * @param [tension=0.5]
     */
    constructor(points?: Vector3[], closed?: boolean, curveType?: string, tension?: number);

    /**
     * @default 'CatmullRomCurve3'
     */
    type: string;

    /**
     * @default []
     */
    points: Vector3[];
}
