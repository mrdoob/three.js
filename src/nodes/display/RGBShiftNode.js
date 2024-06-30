import TempNode from '../core/TempNode.js';
import { nodeObject, addNodeElement, tslFn, vec2, vec4 } from '../shadernode/ShaderNode.js';
import { uniform } from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uv } from '../accessors/UVNode.js';
import { sin, cos } from '../math/MathNode.js';

class RGBShiftNode extends TempNode {

	constructor( textureNode, amount = 0.005, angle = 0 ) {

		super( 'vec4' );

		this.textureNode = textureNode;
		this.amount = uniform( amount );
		this.angle = uniform( angle );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore() {

	}

	setup() {

		const { textureNode } = this;

		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => this.textureNode.uv( uv );

		const rgbShift = tslFn( () => {

			const offset = vec2( cos( this.angle ), sin( this.angle ) ).mul( this.amount );
			const cr = sampleTexture( uvNode.add( offset ) );
			const cga = sampleTexture( uvNode );
			const cb = sampleTexture( uvNode.sub( offset ) );

			return vec4( cr.r, cga.g, cb.b, cga.a );

		} );

		return rgbShift();

	}

}

export const rgbShift = ( node, amount, angle ) => nodeObject( new RGBShiftNode( nodeObject( node ), amount, angle ) );

addNodeElement( 'rgbShift', rgbShift );

export default RGBShiftNode;

