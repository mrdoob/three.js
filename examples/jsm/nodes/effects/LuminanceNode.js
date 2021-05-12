import { TempNode } from '../core/TempNode.js';
import { ConstNode } from '../core/ConstNode.js';
import { FunctionNode } from '../core/FunctionNode.js';

class LuminanceNode extends TempNode {

	constructor( rgb ) {

		super( 'f' );

		this.rgb = rgb;

	}

	generate( builder, output ) {

		const luminance = builder.include( LuminanceNode.Nodes.luminance );

		return builder.format( luminance + '( ' + this.rgb.build( builder, 'v3' ) + ' )', this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.rgb = source.rgb;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.rgb = this.rgb.toJSON( meta ).uuid;

		}

		return data;

	}

}

LuminanceNode.Nodes = ( function () {

	const LUMA = new ConstNode( 'vec3 LUMA vec3( 0.2125, 0.7154, 0.0721 )' );

	// Algorithm from Chapter 10 of Graphics Shaders

	const luminance = new FunctionNode( /* glsl */`

		float luminance( vec3 rgb ) {

			return dot( rgb, LUMA );

		}`
	, [ LUMA ] );

	return {
		LUMA: LUMA,
		luminance: luminance
	};

} )();

LuminanceNode.prototype.nodeType = 'Luminance';

export { LuminanceNode };
