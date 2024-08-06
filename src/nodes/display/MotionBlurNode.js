import { float, int, Fn } from '../shadernode/ShaderNode.js';
import { Loop } from '../utils/LoopNode.js';
import { uv } from '../accessors/UVNode.js';
import { velocity } from '../accessors/VelocityNode.js';

export const motionBlur = Fn( ( [ inputNode, ndcPositionCurrent, ndcPositionPrevious, intensity = 1 ] ) => {

	const sampleColor = ( uv ) => inputNode.uv( uv );
	const sampleVelocity = ( uv ) => velocity( ndcPositionCurrent.uv( uv ), ndcPositionPrevious.uv( uv ) ).mul( intensity ).rg;

	const NUM_SAMPLES = int( 30 );

	const uvs = uv();

	const colorResult = sampleColor( uvs ).toVar();
	const velocityResult = sampleVelocity( uvs ).toVar();

	Loop( { start: int( 1 ), end: NUM_SAMPLES, type: 'int', condition: '<=' }, ( { i } ) => {

		const offset = velocityResult.mul( float( i.sub( 1 ) ).div( float( NUM_SAMPLES ) ).sub( 0.5 ) );
		colorResult.addAssign( sampleColor( uvs.add( offset ) ) );

	} );

	colorResult.divAssign( float( NUM_SAMPLES ).add( 1 ) );

	return colorResult;

} );
