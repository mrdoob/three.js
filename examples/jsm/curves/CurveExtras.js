import {
	Curve,
	Vector3
} from '../../../build/three.module.js';

/**
 * A bunch of parametric curves
 *
 * Formulas collected from various sources
 * http://mathworld.wolfram.com/HeartCurve.html
 * http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page6.html
 * http://en.wikipedia.org/wiki/Viviani%27s_curve
 * http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page4.html
 * http://www.mi.sanu.ac.rs/vismath/taylorapril2011/Taylor.pdf
 * https://prideout.net/blog/old/blog/index.html@p=44.html
 */

var Curves = ( function () {

	// GrannyKnot

	function GrannyKnot() {

		Curve.call( this );

	}

	GrannyKnot.prototype = Object.create( Curve.prototype );
	GrannyKnot.prototype.constructor = GrannyKnot;

	GrannyKnot.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		t = 2 * Math.PI * t;

		var x = - 0.22 * Math.cos( t ) - 1.28 * Math.sin( t ) - 0.44 * Math.cos( 3 * t ) - 0.78 * Math.sin( 3 * t );
		var y = - 0.1 * Math.cos( 2 * t ) - 0.27 * Math.sin( 2 * t ) + 0.38 * Math.cos( 4 * t ) + 0.46 * Math.sin( 4 * t );
		var z = 0.7 * Math.cos( 3 * t ) - 0.4 * Math.sin( 3 * t );

		return point.set( x, y, z ).multiplyScalar( 20 );

	};

	// HeartCurve

	function HeartCurve( scale ) {

		Curve.call( this );

		this.scale = ( scale === undefined ) ? 5 : scale;

	}

	HeartCurve.prototype = Object.create( Curve.prototype );
	HeartCurve.prototype.constructor = HeartCurve;

	HeartCurve.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		t *= 2 * Math.PI;

		var x = 16 * Math.pow( Math.sin( t ), 3 );
		var y = 13 * Math.cos( t ) - 5 * Math.cos( 2 * t ) - 2 * Math.cos( 3 * t ) - Math.cos( 4 * t );
		var z = 0;

		return point.set( x, y, z ).multiplyScalar( this.scale );

	};

	// Viviani's Curve

	function VivianiCurve( scale ) {

		Curve.call( this );

		this.scale = ( scale === undefined ) ? 70 : scale;

	}

	VivianiCurve.prototype = Object.create( Curve.prototype );
	VivianiCurve.prototype.constructor = VivianiCurve;

	VivianiCurve.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		t = t * 4 * Math.PI; // normalized to 0..1
		var a = this.scale / 2;

		var x = a * ( 1 + Math.cos( t ) );
		var y = a * Math.sin( t );
		var z = 2 * a * Math.sin( t / 2 );

		return point.set( x, y, z );

	};

	// KnotCurve

	function KnotCurve() {

		Curve.call( this );

	}

	KnotCurve.prototype = Object.create( Curve.prototype );
	KnotCurve.prototype.constructor = KnotCurve;

	KnotCurve.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		t *= 2 * Math.PI;

		var R = 10;
		var s = 50;

		var x = s * Math.sin( t );
		var y = Math.cos( t ) * ( R + s * Math.cos( t ) );
		var z = Math.sin( t ) * ( R + s * Math.cos( t ) );

		return point.set( x, y, z );

	};

	// HelixCurve

	function HelixCurve() {

		Curve.call( this );

	}

	HelixCurve.prototype = Object.create( Curve.prototype );
	HelixCurve.prototype.constructor = HelixCurve;

	HelixCurve.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		var a = 30; // radius
		var b = 150; // height

		var t2 = 2 * Math.PI * t * b / 30;

		var x = Math.cos( t2 ) * a;
		var y = Math.sin( t2 ) * a;
		var z = b * t;

		return point.set( x, y, z );

	};

	// TrefoilKnot

	function TrefoilKnot( scale ) {

		Curve.call( this );

		this.scale = ( scale === undefined ) ? 10 : scale;

	}

	TrefoilKnot.prototype = Object.create( Curve.prototype );
	TrefoilKnot.prototype.constructor = TrefoilKnot;

	TrefoilKnot.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		t *= Math.PI * 2;

		var x = ( 2 + Math.cos( 3 * t ) ) * Math.cos( 2 * t );
		var y = ( 2 + Math.cos( 3 * t ) ) * Math.sin( 2 * t );
		var z = Math.sin( 3 * t );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	};

	// TorusKnot

	function TorusKnot( scale ) {

		Curve.call( this );

		this.scale = ( scale === undefined ) ? 10 : scale;

	}

	TorusKnot.prototype = Object.create( Curve.prototype );
	TorusKnot.prototype.constructor = TorusKnot;

	TorusKnot.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		var p = 3;
		var q = 4;

		t *= Math.PI * 2;

		var x = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t );
		var y = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t );
		var z = Math.sin( q * t );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	};

	// CinquefoilKnot

	function CinquefoilKnot( scale ) {

		Curve.call( this );

		this.scale = ( scale === undefined ) ? 10 : scale;

	}

	CinquefoilKnot.prototype = Object.create( Curve.prototype );
	CinquefoilKnot.prototype.constructor = CinquefoilKnot;

	CinquefoilKnot.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		var p = 2;
		var q = 5;

		t *= Math.PI * 2;

		var x = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t );
		var y = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t );
		var z = Math.sin( q * t );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	};

	// TrefoilPolynomialKnot

	function TrefoilPolynomialKnot( scale ) {

		Curve.call( this );

		this.scale = ( scale === undefined ) ? 10 : scale;

	}

	TrefoilPolynomialKnot.prototype = Object.create( Curve.prototype );
	TrefoilPolynomialKnot.prototype.constructor = TrefoilPolynomialKnot;

	TrefoilPolynomialKnot.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		t = t * 4 - 2;

		var x = Math.pow( t, 3 ) - 3 * t;
		var y = Math.pow( t, 4 ) - 4 * t * t;
		var z = 1 / 5 * Math.pow( t, 5 ) - 2 * t;

		return point.set( x, y, z ).multiplyScalar( this.scale );

	};

	var scaleTo = function ( x, y, t ) {

		var r = y - x;
		return t * r + x;

	};

	// FigureEightPolynomialKnot

	function FigureEightPolynomialKnot( scale ) {

		Curve.call( this );

		this.scale = ( scale === undefined ) ? 1 : scale;

	}

	FigureEightPolynomialKnot.prototype = Object.create( Curve.prototype );
	FigureEightPolynomialKnot.prototype.constructor = FigureEightPolynomialKnot;

	FigureEightPolynomialKnot.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		t = scaleTo( - 4, 4, t );

		var x = 2 / 5 * t * ( t * t - 7 ) * ( t * t - 10 );
		var y = Math.pow( t, 4 ) - 13 * t * t;
		var z = 1 / 10 * t * ( t * t - 4 ) * ( t * t - 9 ) * ( t * t - 12 );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	};

	// DecoratedTorusKnot4a

	function DecoratedTorusKnot4a( scale ) {

		Curve.call( this );

		this.scale = ( scale === undefined ) ? 40 : scale;

	}

	DecoratedTorusKnot4a.prototype = Object.create( Curve.prototype );
	DecoratedTorusKnot4a.prototype.constructor = DecoratedTorusKnot4a;

	DecoratedTorusKnot4a.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		t *= Math.PI * 2;

		var x = Math.cos( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) );
		var y = Math.sin( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) );
		var z = 0.35 * Math.sin( 5 * t );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	};

	// DecoratedTorusKnot4b

	function DecoratedTorusKnot4b( scale ) {

		Curve.call( this );

		this.scale = ( scale === undefined ) ? 40 : scale;

	}

	DecoratedTorusKnot4b.prototype = Object.create( Curve.prototype );
	DecoratedTorusKnot4b.prototype.constructor = DecoratedTorusKnot4b;

	DecoratedTorusKnot4b.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		var fi = t * Math.PI * 2;

		var x = Math.cos( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) );
		var y = Math.sin( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) );
		var z = 0.2 * Math.sin( 9 * fi );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	};

	// DecoratedTorusKnot5a

	function DecoratedTorusKnot5a( scale ) {

		Curve.call( this );

		this.scale = ( scale === undefined ) ? 40 : scale;

	}

	DecoratedTorusKnot5a.prototype = Object.create( Curve.prototype );
	DecoratedTorusKnot5a.prototype.constructor = DecoratedTorusKnot5a;

	DecoratedTorusKnot5a.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		var fi = t * Math.PI * 2;

		var x = Math.cos( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) );
		var y = Math.sin( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) );
		var z = 0.2 * Math.sin( 20 * fi );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	};

	// DecoratedTorusKnot5c

	function DecoratedTorusKnot5c( scale ) {

		Curve.call( this );

		this.scale = ( scale === undefined ) ? 40 : scale;

	}

	DecoratedTorusKnot5c.prototype = Object.create( Curve.prototype );
	DecoratedTorusKnot5c.prototype.constructor = DecoratedTorusKnot5c;

	DecoratedTorusKnot5c.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector3();

		var fi = t * Math.PI * 2;

		var x = Math.cos( 4 * fi ) * ( 1 + 0.5 * ( Math.cos( 5 * fi ) + 0.4 * Math.cos( 20 * fi ) ) );
		var y = Math.sin( 4 * fi ) * ( 1 + 0.5 * ( Math.cos( 5 * fi ) + 0.4 * Math.cos( 20 * fi ) ) );
		var z = 0.35 * Math.sin( 15 * fi );

		return point.set( x, y, z ).multiplyScalar( this.scale );

	};

	return {
		GrannyKnot: GrannyKnot,
		HeartCurve: HeartCurve,
		VivianiCurve: VivianiCurve,
		KnotCurve: KnotCurve,
		HelixCurve: HelixCurve,
		TrefoilKnot: TrefoilKnot,
		TorusKnot: TorusKnot,
		CinquefoilKnot: CinquefoilKnot,
		TrefoilPolynomialKnot: TrefoilPolynomialKnot,
		FigureEightPolynomialKnot: FigureEightPolynomialKnot,
		DecoratedTorusKnot4a: DecoratedTorusKnot4a,
		DecoratedTorusKnot4b: DecoratedTorusKnot4b,
		DecoratedTorusKnot5a: DecoratedTorusKnot5a,
		DecoratedTorusKnot5c: DecoratedTorusKnot5c
	};

} )();

export { Curves };
