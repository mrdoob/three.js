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

// GrannyKnot

class GrannyKnot extends Curve {

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t = 2 * Math.PI * t;

		const x = - 0.22 * Math.cos( t ) - 1.28 * Math.sin( t ) - 0.44 * Math.cos( 3 * t ) - 0.78 * Math.sin( 3 * t );
		const y = - 0.1 * Math.cos( 2 * t ) - 0.27 * Math.sin( 2 * t ) + 0.38 * Math.cos( 4 * t ) + 0.46 * Math.sin( 4 * t );
		const z = 0.7 * Math.cos( 3 * t ) - 0.4 * Math.sin( 3 * t );

		return point.set( x, y, z ).multiplyScalar( 20 );

	}

}

// HeartCurve

class HeartCurve extends Curve {

	constructor( scale = 5 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t *= 2 * Math.PI;

		const x = 16 * Math.pow( Math.sin( t ), 3 );
		const y = 13 * Math.cos( t ) - 5 * Math.cos( 2 * t ) - 2 * Math.cos( 3 * t ) - Math.cos( 4 * t );
		const z = 0;

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

// Viviani's Curve

class VivianiCurve extends Curve {

	constructor( scale = 70 ) {

		super();

		this.scale = scale;

	}

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

// KnotCurve

class KnotCurve extends Curve {

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


// HelixCurve

class HelixCurve extends Curve {

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

// TrefoilKnot

class TrefoilKnot extends Curve {

	constructor( scale = 10 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t *= Math.PI * 2;

		const x = ( 2 + Math.cos( 3 * t ) ) * Math.cos( 2 * t );
		const y = ( 2 + Math.cos( 3 * t ) ) * Math.sin( 2 * t );
		const z = Math.sin( 3 * t );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

// TorusKnot

class TorusKnot extends Curve {

	constructor( scale = 10 ) {

		super();

		this.scale = scale;

	}

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

// CinquefoilKnot

class CinquefoilKnot extends Curve {

	constructor( scale = 10 ) {

		super();

		this.scale = scale;

	}

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


// TrefoilPolynomialKnot

class TrefoilPolynomialKnot extends Curve {

	constructor( scale = 10 ) {

		super();

		this.scale = scale;

	}

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

// FigureEightPolynomialKnot

class FigureEightPolynomialKnot extends Curve {

	constructor( scale = 1 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t = scaleTo( - 4, 4, t );

		const x = 2 / 5 * t * ( t * t - 7 ) * ( t * t - 10 );
		const y = Math.pow( t, 4 ) - 13 * t * t;
		const z = 1 / 10 * t * ( t * t - 4 ) * ( t * t - 9 ) * ( t * t - 12 );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

// DecoratedTorusKnot4a

class DecoratedTorusKnot4a extends Curve {

	constructor( scale = 40 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t *= Math.PI * 2;

		const x = Math.cos( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) );
		const y = Math.sin( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) );
		const z = 0.35 * Math.sin( 5 * t );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

// DecoratedTorusKnot4b

class DecoratedTorusKnot4b extends Curve {

	constructor( scale = 40 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const fi = t * Math.PI * 2;

		const x = Math.cos( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) );
		const y = Math.sin( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) );
		const z = 0.2 * Math.sin( 9 * fi );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}


// DecoratedTorusKnot5a

class DecoratedTorusKnot5a extends Curve {

	constructor( scale = 40 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const fi = t * Math.PI * 2;

		const x = Math.cos( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) );
		const y = Math.sin( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) );
		const z = 0.2 * Math.sin( 20 * fi );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

// DecoratedTorusKnot5c

class DecoratedTorusKnot5c extends Curve {

	constructor( scale = 40 ) {

		super();

		this.scale = scale;

	}

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
