import TempNode from '../core/TempNode.js';
import { nodeObject, addNodeElement, tslFn, vec3, vec4, float } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uv } from '../accessors/UVNode.js';
import { min } from '../math/MathNode.js';
import { dot } from '../math/MathNode.js';

import { property } from '../core/PropertyNode.js';

class SepiaNode extends TempNode {

	constructor( textureNode, amount ) {

		super( 'vec4' );

		this.textureNode = textureNode;
		this.amount = amount;

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	setup() {

		const textureNode = this.textureNode;
		const amount = this.amount;
		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.uv( uv );

		const sepia = tslFn( () => {

			const color = sampleTexture( uvNode );
			const c = property( 'vec3', 'c' ).assign( color.rgb );

			color.r = dot( c, vec3( float( 1.0 ).sub( amount.mul( 0.607 ) ), amount.mul( 0.769 ), amount.mul( 0.189 ) ) );
			color.g = dot( c, vec3( amount.mul( 0.349 ), float( 1.0 ).sub( amount.mul( 0.314 ) ), amount.mul( 0.168 ) ) );
			color.b = dot( c, vec3( amount.mul( 0.272 ), amount.mul( 0.534 ), float( 1.0 ).sub( amount.mul( 0.869 ) ) ) );

			return vec4( min( vec3( 1.0 ), color.rgb ), color.a );

		} );

		const outputNode = sepia();

		return outputNode;

	}

}

export const sepia = ( node, amount ) => nodeObject( new SepiaNode( nodeObject( node ).toTexture(), nodeObject( amount ) ) );

addNodeElement( 'sepia', sepia );

export default SepiaNode;
