import { Fn, vec3 } from '../../tsl/TSLBase.js';

const Schlick_to_F0 = /*@__PURE__*/ Fn( ( { f, f90, dotVH } ) => {

	const x = dotVH.oneMinus().saturate();
	const x2 = x.mul( x );
	const x5 = x.mul( x2, x2 ).clamp( 0, .9999 );

	return f.sub( vec3( f90 ).mul( x5 ) ).div( x5.oneMinus() );

}, { f: 'vec3', f90: 'float', dotVH: 'float', return: 'vec3' } );

export default Schlick_to_F0;
