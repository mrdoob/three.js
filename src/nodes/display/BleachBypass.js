import { float, Fn, vec3, vec4 } from '../tsl/TSLBase.js';
import { min, max, mix } from '../math/MathNode.js';
import { luminance } from './ColorAdjustment.js';

export const bleach = /*@__PURE__*/ Fn( ( [ color, opacity = 1 ] ) => {

	const base = color;
	const lum = luminance( base.rgb );
	const blend = vec3( lum );

	const L = min( 1.0, max( 0.0, float( 10.0 ).mul( lum.sub( 0.45 ) ) ) );

	const result1 = blend.mul( base.rgb ).mul( 2.0 );
	const result2 = float( 2.0 ).mul( blend.oneMinus() ).mul( base.rgb.oneMinus() ).oneMinus();

	const newColor = mix( result1, result2, L );

	const A2 = base.a.mul( opacity );

	const mixRGB = A2.mul( newColor.rgb );

	mixRGB.addAssign( base.rgb.mul( A2.oneMinus() ) );

	return vec4( mixRGB, base.a );

} );
