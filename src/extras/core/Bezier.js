/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Bezier Curves formulas obtained from
 * http://en.wikipedia.org/wiki/Bézier_curve
 */

// Quad Bezier Functions

function b2p0( t, p ) {

	var k = 1 - t;
	return k * k * p;

}

function b2p1( t, p ) {

	return 2 * ( 1 - t ) * t * p;

}

function b2p2( t, p ) {

	return t * t * p;

}

function b2( t, p0, p1, p2 ) {

	return b2p0( t, p0 ) + b2p1( t, p1 ) + b2p2( t, p2 );

}

// Cubic Bezier Functions

function b3p0( t, p ) {

	var k = 1 - t;
	return k * k * k * p;

}

function b3p1( t, p ) {

	var k = 1 - t;
	return 3 * k * k * t * p;

}

function b3p2( t, p ) {

	var k = 1 - t;
	return 3 * k * t * t * p;

}

function b3p3( t, p ) {

	return t * t * t * p;

}

function b3( t, p0, p1, p2, p3 ) {

	return b3p0( t, p0 ) + b3p1( t, p1 ) + b3p2( t, p2 ) + b3p3( t, p3 );

}

//

function tangentQuadraticBezier( t, p0, p1, p2 ) {

	return 2 * ( 1 - t ) * ( p1 - p0 ) + 2 * t * ( p2 - p1 );

}

function tangentCubicBezier( t, p0, p1, p2, p3 ) {

	return - 3 * p0 * ( 1 - t ) * ( 1 - t ) +
		3 * p1 * ( 1 - t ) * ( 1 - t ) - 6 * t * p1 * ( 1 - t ) +
		6 * t * p2 * ( 1 - t ) - 3 * t * t * p2 +
		3 * t * t * p3;

}

export { b2, b3, tangentQuadraticBezier, tangentCubicBezier };
