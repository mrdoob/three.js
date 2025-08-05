import {
	Curve,
	Vector3
} from 'three';

/**
 * A bunch of parametric curves
 *
 * Formulas collected from various sources
 * http://mathworld.wolfram.com/HeartCurve.html
 * http://en.wikipedia.org/wiki/Viviani%27s_curve
 * http://www.mi.sanu.ac.rs/vismath/taylorapril2011/Taylor.pdf
 * https://prideout.net/blog/old/blog/index.html@p=44.html
 */

/**
 * A Granny Knot curve.
 *
 * @augments Curve
 * @three_import import { GrannyKnot } from 'three/addons/curves/CurveExtras.js';
 */
class GrannyKnot extends Curve {

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t = 2 * Math.PI * t;

		const x = - 0.22 * Math.cos( t ) - 1.28 * Math.sin( t ) - 0.44 * Math.cos( 3 * t ) - 0.78 * Math.sin( 3 * t );
		const y = - 0.1 * Math.cos( 2 * t ) - 0.27 * Math.sin( 2 * t ) + 0.38 * Math.cos( 4 * t ) + 0.46 * Math.sin( 4 * t );
		const z = 0.7 * Math.cos( 3 * t ) - 0.4 * Math.sin( 3 * t );

		return point.set( x, y, z ).multiplyScalar( 20 );

	}

}

/**
 * A heart curve.
 *
 * @augments Curve
 * @three_import import { HeartCurve } from 'three/addons/curves/CurveExtras.js';
 */
class HeartCurve extends Curve {

	/**
	 * Constructs a new heart curve.
	 *
	 * @param {number} [scale=5] - The curve's scale.
	 */
	constructor( scale = 5 ) {

		super();

		/**
		 * The curve's scale.
		 *
		 * @type {number}
		 * @default 5
		 */
		this.scale = scale;

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t *= 2 * Math.PI;

		const x = 16 * Math.pow( Math.sin( t ), 3 );
		const y = 13 * Math.cos( t ) - 5 * Math.cos( 2 * t ) - 2 * Math.cos( 3 * t ) - Math.cos( 4 * t );
		const z = 0;

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

/**
 * A Viviani curve.
 *
 * @augments Curve
 * @three_import import { VivianiCurve } from 'three/addons/curves/CurveExtras.js';
 */
class VivianiCurve extends Curve {

	/**
	 * Constructs a new Viviani curve.
	 *
	 * @param {number} [scale=70] - The curve's scale.
	 */
	constructor( scale = 70 ) {

		super();

		/**
		 * The curve's scale.
		 *
		 * @type {number}
		 * @default 70
		 */
		this.scale = scale;

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t = t * 4 * Math.PI; // normalized to 0..1
		const a = this.scale / 2;

		const x = a * ( 1 + Math.cos( t ) );
		const y = a * Math.sin( t );
		const z = 2 * a * Math.sin( t / 2 );

		return point.set( x, y, z );

	}

}

/**
 * A knot curve.
 *
 * @augments Curve
 * @three_import import { KnotCurve } from 'three/addons/curves/CurveExtras.js';
 */
class KnotCurve extends Curve {

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t *= 2 * Math.PI;

		const R = 10;
		const s = 50;

		const x = s * Math.sin( t );
		const y = Math.cos( t ) * ( R + s * Math.cos( t ) );
		const z = Math.sin( t ) * ( R + s * Math.cos( t ) );

		return point.set( x, y, z );

	}

}

/**
 * A helix curve.
 *
 * @augments Curve
 * @three_import import { HelixCurve } from 'three/addons/curves/CurveExtras.js';
 */
class HelixCurve extends Curve {

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const a = 30; // radius
		const b = 150; // height

		const t2 = 2 * Math.PI * t * b / 30;

		const x = Math.cos( t2 ) * a;
		const y = Math.sin( t2 ) * a;
		const z = b * t;

		return point.set( x, y, z );

	}

}

/**
 * A Trefoil Knot.
 *
 * @augments Curve
 * @three_import import { TrefoilKnot } from 'three/addons/curves/CurveExtras.js';
 */
class TrefoilKnot extends Curve {

	/**
	 * Constructs a new Trefoil Knot.
	 *
	 * @param {number} [scale=10] - The curve's scale.
	 */
	constructor( scale = 10 ) {

		super();

		/**
		 * The curve's scale.
		 *
		 * @type {number}
		 * @default 10
		 */
		this.scale = scale;

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t *= Math.PI * 2;

		const x = ( 2 + Math.cos( 3 * t ) ) * Math.cos( 2 * t );
		const y = ( 2 + Math.cos( 3 * t ) ) * Math.sin( 2 * t );
		const z = Math.sin( 3 * t );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

/**
 * A torus knot.
 *
 * @augments Curve
 * @three_import import { TorusKnot } from 'three/addons/curves/CurveExtras.js';
 */
class TorusKnot extends Curve {

	/**
	 * Constructs a new torus knot.
	 *
	 * @param {number} [scale=10] - The curve's scale.
	 */
	constructor( scale = 10 ) {

		super();

		/**
		 * The curve's scale.
		 *
		 * @type {number}
		 * @default 10
		 */
		this.scale = scale;

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const p = 3;
		const q = 4;

		t *= Math.PI * 2;

		const x = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t );
		const y = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t );
		const z = Math.sin( q * t );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

/**
 * A Cinquefoil Knot.
 *
 * @augments Curve
 * @three_import import { CinquefoilKnot } from 'three/addons/curves/CurveExtras.js';
 */
class CinquefoilKnot extends Curve {

	/**
	 * Constructs a new Cinquefoil Knot.
	 *
	 * @param {number} [scale=10] - The curve's scale.
	 */
	constructor( scale = 10 ) {

		super();

		/**
		 * The curve's scale.
		 *
		 * @type {number}
		 * @default 10
		 */
		this.scale = scale;

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const p = 2;
		const q = 5;

		t *= Math.PI * 2;

		const x = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t );
		const y = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t );
		const z = Math.sin( q * t );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

/**
 * A Trefoil Polynomial Knot.
 *
 * @augments Curve
 * @three_import import { TrefoilPolynomialKnot } from 'three/addons/curves/CurveExtras.js';
 */
class TrefoilPolynomialKnot extends Curve {

	/**
	 * Constructs a new Trefoil Polynomial Knot.
	 *
	 * @param {number} [scale=10] - The curve's scale.
	 */
	constructor( scale = 10 ) {

		super();

		/**
		 * The curve's scale.
		 *
		 * @type {number}
		 * @default 10
		 */
		this.scale = scale;

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t = t * 4 - 2;

		const x = Math.pow( t, 3 ) - 3 * t;
		const y = Math.pow( t, 4 ) - 4 * t * t;
		const z = 1 / 5 * Math.pow( t, 5 ) - 2 * t;

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

function scaleTo( x, y, t ) {

	const r = y - x;
	return t * r + x;

}

/**
 * A Figure Eight Polynomial Knot.
 *
 * @augments Curve
 * @three_import import { FigureEightPolynomialKnot } from 'three/addons/curves/CurveExtras.js';
 */
class FigureEightPolynomialKnot extends Curve {

	/**
	 * Constructs a new Figure Eight Polynomial Knot.
	 *
	 * @param {number} [scale=1] - The curve's scale.
	 */
	constructor( scale = 1 ) {

		super();

		/**
		 * The curve's scale.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.scale = scale;

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t = scaleTo( - 4, 4, t );

		const x = 2 / 5 * t * ( t * t - 7 ) * ( t * t - 10 );
		const y = Math.pow( t, 4 ) - 13 * t * t;
		const z = 1 / 10 * t * ( t * t - 4 ) * ( t * t - 9 ) * ( t * t - 12 );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

/**
 * A Decorated Torus Knot 4a.
 *
 * @augments Curve
 * @three_import import { DecoratedTorusKnot4a } from 'three/addons/curves/CurveExtras.js';
 */
class DecoratedTorusKnot4a extends Curve {

	/**
	 * Constructs a new Decorated Torus Knot 4a.
	 *
	 * @param {number} [scale=1] - The curve's scale.
	 */
	constructor( scale = 40 ) {

		super();

		/**
		 * The curve's scale.
		 *
		 * @type {number}
		 * @default 40
		 */
		this.scale = scale;

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t *= Math.PI * 2;

		const x = Math.cos( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) );
		const y = Math.sin( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) );
		const z = 0.35 * Math.sin( 5 * t );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

/**
 * A Decorated Torus Knot 4b.
 *
 * @augments Curve
 * @three_import import { DecoratedTorusKnot4b } from 'three/addons/curves/CurveExtras.js';
 */
class DecoratedTorusKnot4b extends Curve {

	/**
	 * Constructs a new Decorated Torus Knot 4b.
	 *
	 * @param {number} [scale=1] - The curve's scale.
	 */
	constructor( scale = 40 ) {

		super();

		/**
		 * The curve's scale.
		 *
		 * @type {number}
		 * @default 40
		 */
		this.scale = scale;

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const fi = t * Math.PI * 2;

		const x = Math.cos( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) );
		const y = Math.sin( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) );
		const z = 0.2 * Math.sin( 9 * fi );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

/**
 * A Decorated Torus Knot 5a.
 *
 * @augments Curve
 * @three_import import { DecoratedTorusKnot5a } from 'three/addons/curves/CurveExtras.js';
 */
class DecoratedTorusKnot5a extends Curve {

	/**
	 * Constructs a new Decorated Torus Knot 5a.
	 *
	 * @param {number} [scale=1] - The curve's scale.
	 */
	constructor( scale = 40 ) {

		super();

		/**
		 * The curve's scale.
		 *
		 * @type {number}
		 * @default 40
		 */
		this.scale = scale;

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const fi = t * Math.PI * 2;

		const x = Math.cos( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) );
		const y = Math.sin( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) );
		const z = 0.2 * Math.sin( 20 * fi );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

/**
 * A Decorated Torus Knot 5c.
 *
 * @augments Curve
 * @three_import import { DecoratedTorusKnot5c } from 'three/addons/curves/CurveExtras.js';
 */
class DecoratedTorusKnot5c extends Curve {

	/**
	 * Constructs a new Decorated Torus Knot 5c.
	 *
	 * @param {number} [scale=1] - The curve's scale.
	 */
	constructor( scale = 40 ) {

		super();

		/**
		 * The curve's scale.
		 *
		 * @type {number}
		 * @default 40
		 */
		this.scale = scale;

	}

	/**
	 * This method returns a vector in 3D space for the given interpolation factor.
	 *
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
	 * @param {Vector3} [optionalTarget] - The optional target vector the result is written to.
	 * @return {Vector3} The position on the curve.
	 */
	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const fi = t * Math.PI * 2;

		const x = Math.cos( 4 * fi ) * ( 1 + 0.5 * ( Math.cos( 5 * fi ) + 0.4 * Math.cos( 20 * fi ) ) );
		const y = Math.sin( 4 * fi ) * ( 1 + 0.5 * ( Math.cos( 5 * fi ) + 0.4 * Math.cos( 20 * fi ) ) );
		const z = 0.35 * Math.sin( 15 * fi );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

export {
	GrannyKnot,
	HeartCurve,
	VivianiCurve,
	KnotCurve,
	HelixCurve,
	TrefoilKnot,
	TorusKnot,
	CinquefoilKnot,
	TrefoilPolynomialKnot,
	FigureEightPolynomialKnot,
	DecoratedTorusKnot4a,
	DecoratedTorusKnot4b,
	DecoratedTorusKnot5a,
	DecoratedTorusKnot5c
};
