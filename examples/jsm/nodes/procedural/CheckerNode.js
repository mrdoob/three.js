import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { UVNode } from '../accessors/UVNode.js';

class CheckerNode extends TempNode {

	constructor( uv ) {

		super( 'f' );

		this.uv = uv || new UVNode();

	}

	generate( builder, output ) {

		const snoise = builder.include( CheckerNode.Nodes.checker );

		return builder.format( snoise + '( ' + this.uv.build( builder, 'v2' ) + ' )', this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.uv = source.uv;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.uv = this.uv.toJSON( meta ).uuid;

		}

		return data;

	}

}

CheckerNode.Nodes = ( function () {

	// https://github.com/mattdesl/glsl-checker/blob/master/index.glsl

	const checker = new FunctionNode( /* glsl */`
		float checker( vec2 uv ) {

			float cx = floor( uv.x );
			float cy = floor( uv.y );
			float result = mod( cx + cy, 2.0 );

			return sign( result );

		}`
	);

	return {
		checker: checker
	};

} )();

CheckerNode.prototype.nodeType = 'Noise';

export { CheckerNode };
