import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { UVNode } from '../accessors/UVNode.js';

class NoiseNode extends TempNode {

	constructor( uv ) {

		super( 'f' );

		this.uv = uv || new UVNode();

	}

	generate( builder, output ) {

		const snoise = builder.include( NoiseNode.Nodes.snoise );

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

NoiseNode.Nodes = ( function () {

	const snoise = new FunctionNode( [
		'float snoise(vec2 co) {',

		'	return fract( sin( dot( co.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );',

		'}'
	].join( '\n' ) );

	return {
		snoise: snoise
	};

} )();

NoiseNode.prototype.nodeType = 'Noise';

export { NoiseNode };
