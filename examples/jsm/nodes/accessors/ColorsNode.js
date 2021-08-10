import { TempNode } from '../core/TempNode.js';

var vertexDict = [ 'color', 'color2' ],
	fragmentDict = [ 'vColor', 'vColor2' ];

class ColorsNode extends TempNode {

	constructor( index ) {

		super( 'v4', { shared: false } );

		this.index = index || 0;

	}

	generate( builder, output ) {

		builder.requires.color[ this.index ] = true;

		const result = builder.isShader( 'vertex' ) ? vertexDict[ this.index ] : fragmentDict[ this.index ];

		return builder.format( result, this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.index = source.index;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.index = this.index;

		}

		return data;

	}

}

ColorsNode.prototype.nodeType = 'Colors';

export { ColorsNode };
