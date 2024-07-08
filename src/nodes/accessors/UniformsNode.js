import { addNodeClass } from '../core/Node.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { getValueType } from '../core/NodeUtils.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';
import BufferNode from './BufferNode.js';

class UniformsElementNode extends ArrayElementNode {

	constructor( arrayBuffer, indexNode ) {

		super( arrayBuffer, indexNode );

		this.isArrayBufferElementNode = true;

	}

	getNodeType( builder ) {

		return this.node.getElementType( builder );

	}

	generate( builder ) {

		const snippet = super.generate( builder );
		const type = this.getNodeType();

		return builder.format( snippet, 'vec4', type );

	}

}

class UniformsNode extends BufferNode {

	constructor( value, elementType = null ) {

		super( null, 'vec4' );

		this.array = value;
		this.elementType = elementType;

		this._elementType = null;
		this._elementLength = 0;

		this.updateType = NodeUpdateType.RENDER;

		this.isArrayBufferNode = true;

	}

	getElementType() {

		return this.elementType || this._elementType;

	}

	getElementLength() {

		return this._elementLength;

	}

	update( /*frame*/ ) {

		const { array, value } = this;

		const elementLength = this.getElementLength();
		const elementType = this.getElementType();

		if ( elementLength === 1 ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 4;

				value[ index ] = array[ i ];

			}

		} else if ( elementType === 'color' ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 4;
				const vector = array[ i ];

				value[ index ] = vector.r;
				value[ index + 1 ] = vector.g;
				value[ index + 2 ] = vector.b || 0;
				//value[ index + 3 ] = vector.a || 0;

			}

		} else {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 4;
				const vector = array[ i ];

				value[ index ] = vector.x;
				value[ index + 1 ] = vector.y;
				value[ index + 2 ] = vector.z || 0;
				value[ index + 3 ] = vector.w || 0;

			}

		}

	}

	setup( builder ) {

		const length = this.array.length;

		this._elementType = this.elementType === null ? getValueType( this.array[ 0 ] ) : this.elementType;
		this._elementLength = builder.getTypeLength( this._elementType );

		let arrayType = Float32Array;

		if ( this._elementType.charAt( 0 ) === 'i' ) arrayType = Int32Array;
		else if ( this._elementType.charAt( 0 ) === 'u' ) arrayType = Uint32Array;

		this.value = new arrayType( length * 4 );
		this.bufferCount = length;
		this.bufferType = builder.changeComponentType( 'vec4', builder.getComponentType( this._elementType ) );

		return super.setup( builder );

	}

	element( indexNode ) {

		return nodeObject( new UniformsElementNode( this, nodeObject( indexNode ) ) );

	}

}

export default UniformsNode;

export const uniforms = ( values, nodeType ) => nodeObject( new UniformsNode( values, nodeType ) );

addNodeClass( 'UniformsNode', UniformsNode );
