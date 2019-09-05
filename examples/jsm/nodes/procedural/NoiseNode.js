/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { UVNode } from '../accessors/UVNode.js';

export const SNOISE = new FunctionNode( [
	"float snoise(vec2 co) {",

	"	return fract( sin( dot( co.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );",

	"}"
].join( "\n" ) );

export class NoiseNode extends TempNode {

	constructor( uv ) {

		super( 'f' );

		this.uv = uv || new UVNode();

		this.nodeType = "Noise";

	}

	generate( builder, output ) {

		var snoise = builder.include( SNOISE );

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
