import { sub, mul, div, add } from './OperatorNode.js';
import { PI, pow, sin } from './MathNode.js';

// remapping functions https://iquilezles.org/articles/functions/
export const parabola = ( x, k ) => pow( mul( 4.0, x.mul( sub( 1.0, x ) ) ), k );
export const gain = ( x, k ) => x.lessThan( 0.5 ) ? parabola( x.mul( 2.0 ), k ).div( 2.0 ) : sub( 1.0, parabola( mul( sub( 1.0, x ), 2.0 ), k ).div( 2.0 ) );
export const pcurve = ( x, a, b ) => pow( div( pow( x, a ), add( pow( x, a ), pow( sub( 1.0, x ), b ) ) ), 1.0 / a );
export const sinc = ( x, k ) => sin( PI.mul( k.mul( x ).sub( 1.0 ) ) ).div( PI.mul( k.mul( x ).sub( 1.0 ) ) );
