import { addNodeElement, tslFn, vec2 } from '../shadernode/ShaderNode.js';

export const rotateUV = tslFn( ( [ uv, rotation, center = vec2( 0.5 ) ] ) => {

	return uv.sub( center ).rotate( rotation ).add( center );

} );

export const spherizeUV = tslFn( ( [ uv, strength, center = vec2( 0.5 ) ] ) => {

	const delta = uv.sub( center );
	const delta2 = delta.dot( delta );
	const delta4 = delta2.mul( delta2 );
	const deltaOffset = delta4.mul( strength );

	return uv.add( delta.mul( deltaOffset ) );

} );

addNodeElement( 'rotateUV', rotateUV );
addNodeElement( 'spherizeUV', spherizeUV );
