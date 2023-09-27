import { tslFn, vec3 } from '../../shadernode/ShaderNode.js';

const Schlick_to_F0 = tslFn( ( { f, f90, dotVH } ) => {

	const x = dotVH.oneMinus().saturate();
	const x2 = x.mul( x );
	const x5 = x.mul( x2, x2 ).clamp( 0, .9999 );

	return f.sub( vec3( f90 ).mul( x5 ) ).div( x5.oneMinus() );

} );

export default Schlick_to_F0;
