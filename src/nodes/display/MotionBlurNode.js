import { float, int, Fn } from '../shadernode/ShaderNode.js';
import { Loop } from '../utils/LoopNode.js';
import { uv } from '../accessors/UVNode.js';

export const motionBlur = /*#__PURE__*/ Fn( ( [ inputNode, velocity ] ) => {

	const sampleColor = ( uv ) => inputNode.uv( uv );

	const NUM_SAMPLES = int( 30 );

	const uvs = uv();

	const colorResult = sampleColor( uvs ).toVar();

	Loop( { start: int( 1 ), end: NUM_SAMPLES, type: 'int', condition: '<=' }, ( { i } ) => {

		const offset = velocity.mul( float( i ).div( float( NUM_SAMPLES ).sub( 1 ) ).sub( 0.5 ) );
		colorResult.addAssign( sampleColor( uvs.add( offset ) ) );

	} );

	colorResult.divAssign( float( NUM_SAMPLES ) );

	return colorResult;

} );
