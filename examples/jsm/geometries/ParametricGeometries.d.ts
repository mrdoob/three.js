import { Curve, Vector3 } from '../../../src/Three';

import { ParametricGeometry } from './ParametricGeometry';

export namespace ParametricGeometries {
    function klein(v: number, u: number, target: Vector3): Vector3;
    function plane(width: number, height: number): (u: number, v: number, target: Vector3) => Vector3;
    function mobius(u: number, t: number, target: Vector3): Vector3;
    function mobius3d(u: number, t: number, target: Vector3): Vector3;

    class TubeGeometry extends ParametricGeometry {
        constructor(
            path: Curve<Vector3>,
            segments?: number,
            radius?: number,
            segmentsRadius?: number,
            closed?: boolean,
        );
    }

    class TorusKnotGeometry extends TubeGeometry {
        constructor(radius?: number, tube?: number, segmentsT?: number, segmentsR?: number, p?: number, q?: number);
    }

    class SphereGeometry extends ParametricGeometry {
        constructor(size: number, u: number, v: number);
    }

    class PlaneGeometry extends ParametricGeometry {
        constructor(width: number, depth: number, segmentsWidth: number, segmentsDepth: number);
    }
}
