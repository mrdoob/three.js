import TempNode from '../core/TempNode.js';
import { nodeObject, Fn, vec2, vec4 } from '../tsl/TSLBase.js';
import { uniform } from '../core/UniformNode.js';
import { uv } from '../accessors/UV.js';
import { sin, cos } from '../math/MathNode.js';
import { convertToTexture } from '../utils/RTTNode.js';

class RGBShiftNode extends TempNode {

	static get type() {

		return 'RGBShiftNode';

	}

	constructor( textureNode, amount = 0.005, angle = 0 ) {

		super( 'vec4' );

		this.textureNode = textureNode;
		this.amount = uniform( amount );
		this.angle = uniform( angle );

	}

	setup() {

		const { textureNode } = this;

		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.uv( uv );

		const rgbShift = Fn( () => {

			const offset = vec2( cos( this.angle ), sin( this.angle ) ).mul( this.amount );
			const cr = sampleTexture( uvNode.add( offset ) );
			const cga = sampleTexture( uvNode );
			const cb = sampleTexture( uvNode.sub( offset ) );

			return vec4( cr.r, cga.g, cb.b, cga.a );

		} );

		return rgbShift();

	}

}

export default RGBShiftNode;

export const rgbShift = ( node, amount, angle ) => nodeObject( new RGBShiftNode( convertToTexture( node ), amount, angle ) );
