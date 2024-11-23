import { TempNode } from 'three/webgpu';
import { nodeObject, Fn, uv, uniform, vec2, sin, cos, vec4, convertToTexture } from 'three/tsl';

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
