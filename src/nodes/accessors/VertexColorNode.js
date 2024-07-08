import { addNodeClass } from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';

import { Vector4 } from '../../math/Vector4.js';

class VertexColorNode extends AttributeNode {

	constructor( index = 0 ) {

		super( null, 'vec4' );

		this.isVertexColorNode = true;

		this.index = index;

	}

	getAttributeName( /*builder*/ ) {

		const index = this.index;

		return 'color' + ( index > 0 ? index : '' );

	}

	generate( builder ) {

		const attributeName = this.getAttributeName( builder );
		const geometryAttribute = builder.hasGeometryAttribute( attributeName );

		let result;

		if ( geometryAttribute === true ) {

			result = super.generate( builder );

		} else {

			// Vertex color fallback should be white
			result = builder.generateConst( this.nodeType, new Vector4( 1, 1, 1, 1 ) );

		}

		return result;

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

export default VertexColorNode;

export const vertexColor = ( ...params ) => nodeObject( new VertexColorNode( ...params ) );

addNodeClass( 'VertexColorNode', VertexColorNode );
