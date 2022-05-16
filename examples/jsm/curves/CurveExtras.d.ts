import { Curve, Vector3 } from '../../../src/Three';

export namespace Curves {
    class GrannyKnot extends Curve<Vector3> {
        constructor();
    }

    class HeartCurve extends Curve<Vector3> {
        constructor(scale?: number);
        scale: number;
    }

    class VivianiCurve extends Curve<Vector3> {
        constructor(scale?: number);
        scale: number;
    }

    class KnotCurve extends Curve<Vector3> {
        constructor();
    }

    class HelixCurve extends Curve<Vector3> {
        constructor();
    }

    class TrefoilKnot extends Curve<Vector3> {
        constructor(scale?: number);
        scale: number;
    }

    class TorusKnot extends Curve<Vector3> {
        constructor(scale?: number);
        scale: number;
    }

    class CinquefoilKnot extends Curve<Vector3> {
        constructor(scale?: number);
        scale: number;
    }

    class TrefoilPolynomialKnot extends Curve<Vector3> {
        constructor(scale?: number);
        scale: number;
    }

    class FigureEightPolynomialKnot extends Curve<Vector3> {
        constructor(scale?: number);
        scale: number;
    }

    class DecoratedTorusKnot4a extends Curve<Vector3> {
        constructor(scale?: number);
        scale: number;
    }

    class DecoratedTorusKnot4b extends Curve<Vector3> {
        constructor(scale?: number);
        scale: number;
    }

    class DecoratedTorusKnot5a extends Curve<Vector3> {
        constructor(scale?: number);
        scale: number;
    }

    class DecoratedTorusKnot5c extends Curve<Vector3> {
        constructor(scale?: number);
        scale: number;
    }
}
