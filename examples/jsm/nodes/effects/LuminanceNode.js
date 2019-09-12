/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NodeLib } from '../core/NodeLib.js';
import { ConstNode } from '../core/ConstNode.js';
import { FunctionNode } from '../core/FunctionNode.js';

export class LuminanceNode extends TempNode {

	constructor( rgb ) {

		super( 'f' );

		this.rgb = rgb;

		this.nodeType = "Luminance";

	}

	generate( builder, output ) {

		var luminance = builder.include( LuminanceNodeLib.luminance );

		return builder.format( luminance + '( ' + this.rgb.build( builder, 'v3' ) + ' )', this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.rgb = source.rgb;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.rgb = this.rgb.toJSON( meta ).uuid;

		}

		return data;

	}

}

export const LuminanceNodeLib = {

	LUMA: NodeLib.add( new ConstNode( 'LUMA', 'v3', 'vec3( 0.2125, 0.7154, 0.0721 )' ) ),

	luminance: NodeLib.add( new FunctionNode( [
		// Algorithm from Chapter 10 of Graphics Shaders
		"float luminance( vec3 rgb ) {",

		"	return dot( rgb, LUMA );",

		"}"
	].join( "\n" ) ) )

}
