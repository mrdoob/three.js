/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Bezier Curves formulas obtained from
 * http://en.wikipedia.org/wiki/Bézier_curve
 */

function QuadraticBezierP0( t, p ) {

	var k = 1 - t;
	return k * k * p;

}

function QuadraticBezierP1( t, p ) {

	return 2 * ( 1 - t ) * t * p;

}

function QuadraticBezierP2( t, p ) {

	return t * t * p;

}

function QuadraticBezier( t, p0, p1, p2 ) {

	return QuadraticBezierP0( t, p0 ) + QuadraticBezierP1( t, p1 ) +
		QuadraticBezierP2( t, p2 );

}

//

function CubicBezierP0( t, p ) {

	var k = 1 - t;
	return k * k * k * p;

}

function CubicBezierP1( t, p ) {

	var k = 1 - t;
	return 3 * k * k * t * p;

}

function CubicBezierP2( t, p ) {

	return 3 * ( 1 - t ) * t * t * p;

}

function CubicBezierP3( t, p ) {

	return t * t * t * p;

}

function CubicBezier( t, p0, p1, p2, p3 ) {

	return CubicBezierP0( t, p0 ) + CubicBezierP1( t, p1 ) + CubicBezierP2( t, p2 ) +
		CubicBezierP3( t, p3 );

}

//

function TangentQuadraticBezier( t, p0, p1, p2 ) {

	return 2 * ( 1 - t ) * ( p1 - p0 ) + 2 * t * ( p2 - p1 );

}

function TangentCubicBezier( t, p0, p1, p2, p3 ) {

	var k = 1 - t;
	return - 3 * p0 * k * k + 3 * p1 * k * k - 6 * t * p1 * k +
		6 * t * p2 * k - 3 * t * t * p2 + 3 * t * t * p3;

}

export { QuadraticBezier, CubicBezier, TangentQuadraticBezier, TangentCubicBezier };
