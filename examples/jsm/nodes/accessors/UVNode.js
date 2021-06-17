import { TempNode } from '../core/TempNode.js';
import { NodeLib } from '../core/NodeLib.js';

class UVNode extends TempNode {

	constructor( index ) {

		super( 'v2', { shared: false } );

		this.index = index || 0;

	}

	generate( builder, output ) {

		builder.requires.uv[ this.index ] = true;

		const uvIndex = this.index > 0 ? this.index + 1 : '';
		const result = builder.isShader( 'vertex' ) ? 'uv' + uvIndex : 'vUv' + uvIndex;

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

UVNode.prototype.nodeType = 'UV';

NodeLib.addKeyword( 'uv', function () {

	return new UVNode();

} );

NodeLib.addKeyword( 'uv2', function () {

	return new UVNode( 1 );

} );

export { UVNode };
