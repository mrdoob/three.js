/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { UVNode } from '../accessors/UVNode.js';

// https://github.com/mattdesl/glsl-checker/blob/master/index.glsl

export const CHECKER = new FunctionNode( [
	"float checker( vec2 uv ) {",

	"	float cx = floor( uv.x );",
	"	float cy = floor( uv.y ); ",
	"	float result = mod( cx + cy, 2.0 );",

	"	return sign( result );",

	"}"
].join( "\n" ) );

export class CheckerNode extends TempNode {

	constructor( uv ) {

		super( 'f' );

		this.uv = uv || new UVNode();

		this.nodeType = "Noise";

	}

	generate( builder, output ) {

		var snoise = builder.include( CHECKER );

		return builder.format( snoise + '( ' + this.uv.build( builder, 'v2' ) + ' )', this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.uv = source.uv;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.uv = this.uv.toJSON( meta ).uuid;

		}

		return data;

	}

}
