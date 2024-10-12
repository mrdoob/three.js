import { float, Fn, vec2, uv, sin, rand, degrees, cos, Loop, vec4 } from 'three/tsl';

// https://www.shadertoy.com/view/4lXXWn

export const hashBlur = /*#__PURE__*/ Fn( ( [ textureNode, bluramount = float( 0.1 ), repeats = float( 45 ) ] ) => {

	const draw = ( uv ) => textureNode.uv( uv );

	const targetUV = textureNode.uvNode || uv();
	const blurred_image = vec4( 0. ).toVar();

	Loop( { start: 0., end: repeats, type: 'float' }, ( { i } ) => {

		const q = vec2( vec2( cos( degrees( i.div( repeats ).mul( 360. ) ) ), sin( degrees( i.div( repeats ).mul( 360. ) ) ) ).mul( rand( vec2( i, targetUV.x.add( targetUV.y ) ) ).add( bluramount ) ) );
		const uv2 = vec2( targetUV.add( q.mul( bluramount ) ) );
		blurred_image.addAssign( draw( uv2 ) );

	} );

	blurred_image.divAssign( repeats );

	return blurred_image;

} );
