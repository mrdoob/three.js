import { addNodeClass } from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';

class UVNode extends AttributeNode {

	constructor( index = 0 ) {

		super( null, 'vec2' );

		this.isUVNode = true;

		this.index = index;

	}

	getAttributeName( /*builder*/ ) {

		const index = this.index;

		return 'uv' + ( index > 0 ? index : '' );

	}

	serialize( data ) {

		super.serialize( data );

		data.index = this.index;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.index = data.index;

	}

}

export default UVNode;

export const uv = ( ...params ) => nodeObject( new UVNode( ...params ) );

addNodeClass( 'UVNode', UVNode );
