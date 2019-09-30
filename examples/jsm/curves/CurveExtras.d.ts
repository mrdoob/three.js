import {
	Curve,
	Vector3
} from '../../../src/Three';


export namespace Curves {

	export class GrannyKnot extends Curve<Vector3> {

  	constructor();

	}

	export class HeartCurve extends Curve<Vector3> {

  	constructor( scale?: number );
		scale: number;

	}

	export class VivianiCurve extends Curve<Vector3> {

  	constructor( scale?: number );
		scale: number;

	}

	export class KnotCurve extends Curve<Vector3> {

  	constructor();

	}

	export class HelixCurve extends Curve<Vector3> {

  	constructor();

	}

	export class TrefoilKnot extends Curve<Vector3> {

  	constructor( scale?: number );
		scale: number;

	}

	export class TorusKnot extends Curve<Vector3> {

  	constructor( scale?: number );
		scale: number;

	}

	export class CinquefoilKnot extends Curve<Vector3> {

  	constructor( scale?: number );
		scale: number;

	}

	export class TrefoilPolynomialKnot extends Curve<Vector3> {

  	constructor( scale?: number );
		scale: number;

	}

	export class FigureEightPolynomialKnot extends Curve<Vector3> {

  	constructor( scale?: number );
		scale: number;

	}

	export class DecoratedTorusKnot4a extends Curve<Vector3> {

  	constructor( scale?: number );
		scale: number;

	}

	export class DecoratedTorusKnot4b extends Curve<Vector3> {

  	constructor( scale?: number );
		scale: number;

	}

	export class DecoratedTorusKnot5a extends Curve<Vector3> {

  	constructor( scale?: number );
		scale: number;

	}

	export class DecoratedTorusKnot5c extends Curve<Vector3> {

  	constructor( scale?: number );
		scale: number;

	}

}
