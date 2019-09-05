/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NodeLib } from '../core/NodeLib.js';

var vertexDict = [ 'uv', 'uv2' ],
	fragmentDict = [ 'vUv', 'vUv2' ];

export class UVNode extends TempNode {

	constructor( index ) {

		super( 'v2' );

		this.index = index || 0;

		this.shared = false;

		this.nodeType = "UV";

	}

	generate( builder, output ) {

		builder.requires.uv[ this.index ] = true;

		var result = builder.isShader( 'vertex' ) ? vertexDict[ this.index ] : fragmentDict[ this.index ];

		return builder.format( result, this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.index = source.index;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.index = this.index;

		}

		return data;

	}

}

NodeLib.addKeyword( 'uv', function () {

	return new UVNode();

} );

NodeLib.addKeyword( 'uv2', function () {

	return new UVNode( 1 );

} );
