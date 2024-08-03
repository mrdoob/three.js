import TempNode from '../core/TempNode.js';
import { nodeObject, addNodeElement, tslFn, float, int } from '../shadernode/ShaderNode.js';
import { loop } from '../utils/LoopNode.js';
import { uv } from '../accessors/UVNode.js';

class MotionBlurNode extends TempNode {

	constructor( inputNode, velocityNode ) {

		super( 'vec4' );

		this.inputNode = inputNode;
		this.velocityNode = velocityNode;

	}

	setup() {

		const sampleColor = ( uv ) => this.inputNode.uv( uv );
		const sampleVelocity = ( uv ) => this.velocityNode.uv( uv ).rg;

		const NUM_SAMPLES = int( 30 );

		const motionBlur = tslFn( () => {

			const uvs = uv();

			const color = sampleColor( uvs ).toVar();
			const velocity = sampleVelocity( uvs ).toVar();

			loop( { start: int( 1 ), end: NUM_SAMPLES, type: 'int', condition: '<=' }, ( { i } ) => {

				const offset = velocity.mul( float( i.sub( 1 ) ).div( float( NUM_SAMPLES ) ).sub( 0.5 ) );
				color.addAssign( sampleColor( uvs.add( offset ) ) );

			} );

			color.divAssign( float( NUM_SAMPLES ).add( 1 ) );

			return color;

		} );

		const outputNode = motionBlur();

		return outputNode;

	}

}

export const motionBlur = ( node, velocity ) => nodeObject( new MotionBlurNode( nodeObject( node ), nodeObject( velocity ) ) );

addNodeElement( 'motionBlur', motionBlur );

export default MotionBlurNode;

