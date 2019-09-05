/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';

var vertexDict = [ 'color', 'color2' ],
	fragmentDict = [ 'vColor', 'vColor2' ];

export class ColorsNode extends TempNode {

	constructor( index ) {

		super( 'v4' );

		this.index = index || 0;

		this.shared = false;

		this.nodeType = "Colors";

	}

	generate( builder, output ) {

		builder.requires.color[ this.index ] = true;

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
