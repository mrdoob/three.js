import { float, vec2, vec3, add, sub, mul, sin, cos, normalize } from '../tsl/TSLBase.js';

export const mx_rotate2d = ( input, amount = 0 ) => {

	input = vec2( input );
	amount = float( amount );

	const rotationRadians = mul( amount, Math.PI / 180.0 );
	const sa = sin( rotationRadians );
	const ca = cos( rotationRadians );
	const x = input.x;
	const y = input.y;

	return vec2( add( mul( ca, x ), mul( sa, y ) ), sub( mul( ca, y ), mul( sa, x ) ) );

};

export const mx_rotate3d = ( input, amount = 0, axis = vec3( 0, 1, 0 ) ) => {

	input = vec3( input );
	amount = float( amount );
	axis = vec3( axis );

	const normalizedAxis = normalize( axis );
	const rotationRadians = mul( amount, Math.PI / 180.0 );
	const s = sin( rotationRadians );
	const c = cos( rotationRadians );
	const oc = sub( 1, c );

	// https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula
	return input.mul( c )
		.add( input.cross( normalizedAxis ).mul( s ) )
		.add( normalizedAxis.mul( normalizedAxis.dot( input ).mul( oc ) ) );

};
