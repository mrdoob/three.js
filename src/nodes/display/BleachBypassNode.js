import { addNodeElement, float, tslFn, vec3, vec4 } from '../shadernode/ShaderNode.js';
import { min, max, dot, mix } from '../math/MathNode.js';

export const bleach = /*@__PURE__*/ tslFn( ( { color, opacity = 1.0 } ) => {

	const base = color;
	const lum = dot( vec3( 0.25, 0.65, 0.1 ), base.rgb );
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

addNodeElement( 'bleach', bleach );
