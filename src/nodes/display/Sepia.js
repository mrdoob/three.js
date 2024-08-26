import { Fn, vec3, vec4 } from '../tsl/TSLBase.js';
import { dot } from '../math/MathNode.js';

export const sepia = /*@__PURE__*/ Fn( ( [ color ] ) => {

	const c = vec3( color );

	// https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/sepia.js

	return vec4(
		dot( c, vec3( 0.393, 0.769, 0.189 ) ),
		dot( c, vec3( 0.349, 0.686, 0.168 ) ),
		dot( c, vec3( 0.272, 0.534, 0.131 ) ),
		color.a
	);

} );
