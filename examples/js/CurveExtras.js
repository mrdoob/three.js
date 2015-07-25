/*
 * A bunch of parametric curves
 * @author zz85
 *
 * Formulas collected from various sources
 *	http://mathworld.wolfram.com/HeartCurve.html
 *	http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page6.html
 *	http://en.wikipedia.org/wiki/Viviani%27s_curve
 *	http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page4.html
 *	http://www.mi.sanu.ac.rs/vismath/taylorapril2011/Taylor.pdf
 *	http://prideout.net/blog/?p=44
 */

// Lets define some curves
THREE.Curves = {};


 THREE.Curves.GrannyKnot = THREE.Curve.create( function() {},

	 function( t ) {

		t = 2 * Math.PI * t;

		var x = - 0.22 * Math.cos( t ) - 1.28 * Math.sin( t ) - 0.44 * Math.cos( 3 * t ) - 0.78 * Math.sin( 3 * t );
		var y = - 0.1 * Math.cos( 2 * t ) - 0.27 * Math.sin( 2 * t ) + 0.38 * Math.cos( 4 * t ) + 0.46 * Math.sin( 4 * t );
		var z = 0.7 * Math.cos( 3 * t ) - 0.4 * Math.sin( 3 * t );
		return new THREE.Vector3( x, y, z ).multiplyScalar( 20 );

	}
);

THREE.Curves.HeartCurve = THREE.Curve.create(

function( s ) {

	this.scale = ( s === undefined ) ? 5 : s;

},

function( t ) {

	t *= 2 * Math.PI;

	var tx = 16 * Math.pow( Math.sin( t ), 3 );
	var ty = 13 * Math.cos( t ) - 5 * Math.cos( 2 * t ) - 2 * Math.cos( 3 * t ) - Math.cos( 4 * t ), tz = 0;

	return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

}

);



// Viviani's Curve
THREE.Curves.VivianiCurve = THREE.Curve.create(

	function( radius ) {

		this.radius = radius;

	},

	function( t ) {

		t = t * 4 * Math.PI; // Normalized to 0..1
		var a = this.radius / 2;
		var tx = a * ( 1 + Math.cos( t ) ),
			ty = a * Math.sin( t ),
			tz = 2 * a * Math.sin( t / 2 );

		return new THREE.Vector3( tx, ty, tz );

	}

);


THREE.Curves.KnotCurve = THREE.Curve.create(

	function() {

	},

	function( t ) {

		t *= 2 * Math.PI;

		var R = 10;
		var s = 50;
		var tx = s * Math.sin( t ),
			ty = Math.cos( t ) * ( R + s * Math.cos( t ) ),
			tz = Math.sin( t ) * ( R + s * Math.cos( t ) );

		return new THREE.Vector3( tx, ty, tz );

	}

);

THREE.Curves.HelixCurve = THREE.Curve.create(

	function() {

	},

	function( t ) {

		var a = 30; // radius
		var b = 150; //height
		var t2 = 2 * Math.PI * t * b / 30;
		var tx = Math.cos( t2 ) * a,
			ty = Math.sin( t2 ) * a,
			tz = b * t;

		return new THREE.Vector3( tx, ty, tz );

	}

);

THREE.Curves.TrefoilKnot = THREE.Curve.create(

	function( s ) {

		this.scale = ( s === undefined ) ? 10 : s;

	},

	function( t ) {

		t *= Math.PI * 2;
		var tx = ( 2 + Math.cos( 3 * t ) ) * Math.cos( 2 * t ),
			ty = ( 2 + Math.cos( 3 * t ) ) * Math.sin( 2 * t ),
			tz = Math.sin( 3 * t );

		return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

	}

);

THREE.Curves.TorusKnot = THREE.Curve.create(

	function( s ) {

		this.scale = ( s === undefined ) ? 10 : s;

	},

	function( t ) {

		var p = 3,
			q = 4;
		t *= Math.PI * 2;
		var tx = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t ),
			ty = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t ),
			tz = Math.sin( q * t );

		return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

	}

);


THREE.Curves.CinquefoilKnot = THREE.Curve.create(

	function( s ) {

		this.scale = ( s === undefined ) ? 10 : s;

	},

	function( t ) {

		var p = 2,
			q = 5;
		t *= Math.PI * 2;
		var tx = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t ),
			ty = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t ),
			tz = Math.sin( q * t );

		return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

	}

);


THREE.Curves.TrefoilPolynomialKnot = THREE.Curve.create(

	function( s ) {

		this.scale = ( s === undefined ) ? 10 : s;

	},

	function( t ) {

		t = t * 4 - 2;
		var tx = Math.pow( t, 3 ) - 3 * t,
			ty = Math.pow( t, 4 ) - 4 * t * t,
			tz = 1 / 5 * Math.pow( t, 5 ) - 2 * t;

		return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

	}

);

// var scaleTo = function(x, y) {
//   var r = y - x;
//   return function(t) {
//     t * r + x;
//   };
// }
var scaleTo = function( x, y, t ) {

	var r = y - x;
	return t * r + x;

};

THREE.Curves.FigureEightPolynomialKnot = THREE.Curve.create(

	function( s ) {

		this.scale = ( s === undefined ) ? 1 : s;

	},

	function( t ) {

		t = scaleTo( - 4, 4, t );
		var tx = 2 / 5 * t * ( t * t - 7 ) * ( t * t - 10 ),
			ty = Math.pow( t, 4 ) - 13 * t * t,
			tz = 1 / 10 * t * ( t * t - 4 ) * ( t * t - 9 ) * ( t * t - 12 );

		return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

	}

);

THREE.Curves.DecoratedTorusKnot4a = THREE.Curve.create(

	function( s ) {

		this.scale = ( s === undefined ) ? 40 : s;

	},

	function( t ) {

		t *= Math.PI * 2;
		var
		x = Math.cos( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) ),
			y = Math.sin( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) ),
			z = 0.35 * Math.sin( 5 * t );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	}

);


THREE.Curves.DecoratedTorusKnot4b = THREE.Curve.create(

	function( s ) {

		this.scale = ( s === undefined ) ? 40 : s;

	},

	function( t ) {

		var fi = t * Math.PI * 2;
		var x = Math.cos( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) ),
			y = Math.sin( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) ),
			z = 0.2 * Math.sin( 9 * fi );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	}

);


THREE.Curves.DecoratedTorusKnot5a = THREE.Curve.create(

	function( s ) {

		this.scale = ( s === undefined ) ? 40 : s;

	},

	function( t ) {

		var fi = t * Math.PI * 2;
		var x = Math.cos( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) ),
			y = Math.sin( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) ),
			z = 0.2 * Math.sin( 20 * fi );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	}

);

THREE.Curves.DecoratedTorusKnot5c = THREE.Curve.create(

	function( s ) {

		this.scale = ( s === undefined ) ? 40 : s;

	},

	function( t ) {

		var fi = t * Math.PI * 2;
		var x = Math.cos( 4 * fi ) * ( 1 + 0.5 * ( Math.cos( 5 * fi ) + 0.4 * Math.cos( 20 * fi ) ) ),
			y = Math.sin( 4 * fi ) * ( 1 + 0.5 * ( Math.cos( 5 * fi ) + 0.4 * Math.cos( 20 * fi ) ) ),
			z = 0.35 * Math.sin( 15 * fi );

		return new THREE.Vector3( x, y, z ).multiplyScalar( this.scale );

	}

);
