import { nodeObject } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { getValueType } from '../core/NodeUtils.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';
import BufferNode from './BufferNode.js';

class UniformArrayElementNode extends ArrayElementNode {

	static get type() {

		return 'UniformArrayElementNode';

	}

	constructor( arrayBuffer, indexNode ) {

		super( arrayBuffer, indexNode );

		this.isArrayBufferElementNode = true;

	}

	generate( builder ) {

		const snippet = super.generate( builder );
		const type = this.getNodeType();
		const paddedType = this.node.getPaddedType();

		return builder.format( snippet, paddedType, type );

	}

}

class UniformArrayNode extends BufferNode {

	static get type() {

		return 'UniformArrayNode';

	}

	constructor( value, elementType = null ) {

		super( null );

		this.array = value;
		this.elementType = elementType === null ? getValueType( value[ 0 ] ) : elementType;
		this.paddedType = this.getPaddedType();

		this.updateType = NodeUpdateType.RENDER;

		this.isArrayBufferNode = true;

	}

	getNodeType() {

		return this.paddedType;

	}

	getElementType() {

		return this.elementType;

	}

	getPaddedType() {

		const elementType = this.elementType;

		let paddedType = 'vec4';

		if ( elementType === 'mat2' ) {

			paddedType = 'mat2';

		} else if ( /mat/.test( elementType ) === true ) {

			paddedType = 'mat4';

		} else if ( elementType.charAt( 0 ) === 'i' ) {

			paddedType = 'ivec4';

		} else if ( elementType.charAt( 0 ) === 'u' ) {

			paddedType = 'uvec4';

		}

		return paddedType;

	}

	update( /*frame*/ ) {

		const { array, value } = this;

		const elementType = this.elementType;

		if ( elementType === 'float' || elementType === 'int' || elementType === 'uint' ) {

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

		} else if ( elementType === 'mat2' ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 4;
				const matrix = array[ i ];

				value[ index ] = matrix.elements[ 0 ];
				value[ index + 1 ] = matrix.elements[ 1 ];
				value[ index + 2 ] = matrix.elements[ 2 ];
				value[ index + 3 ] = matrix.elements[ 3 ];

			}

		} else if ( elementType === 'mat3' ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 16;
				const matrix = array[ i ];

				value[ index ] = matrix.elements[ 0 ];
				value[ index + 1 ] = matrix.elements[ 1 ];
				value[ index + 2 ] = matrix.elements[ 2 ];

				value[ index + 4 ] = matrix.elements[ 3 ];
				value[ index + 5 ] = matrix.elements[ 4 ];
				value[ index + 6 ] = matrix.elements[ 5 ];

				value[ index + 8 ] = matrix.elements[ 6 ];
				value[ index + 9 ] = matrix.elements[ 7 ];
				value[ index + 10 ] = matrix.elements[ 8 ];

				value[ index + 15 ] = 1;

			}

		} else if ( elementType === 'mat4' ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 16;
				const matrix = array[ i ];

				for ( let i = 0; i < matrix.elements.length; i ++ ) {

					value[ index + i ] = matrix.elements[ i ];

				}

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
		const elementType = this.elementType;

		let arrayType = Float32Array;

		const paddedType = this.paddedType;
		const paddedElementLength = builder.getTypeLength( paddedType );

		if ( elementType.charAt( 0 ) === 'i' ) arrayType = Int32Array;
		if ( elementType.charAt( 0 ) === 'u' ) arrayType = Uint32Array;

		this.value = new arrayType( length * paddedElementLength );
		this.bufferCount = length;
		this.bufferType = paddedType;

		return super.setup( builder );

	}

	element( indexNode ) {

		return nodeObject( new UniformArrayElementNode( this, nodeObject( indexNode ) ) );

	}

}

export default UniformArrayNode;

export const uniformArray = ( values, nodeType ) => nodeObject( new UniformArrayNode( values, nodeType ) );

//

export const uniforms = ( values, nodeType ) => { // @deprecated, r168

	console.warn( 'TSL.UniformArrayNode: uniforms() has been renamed to uniformArray().' );
	return nodeObject( new UniformArrayNode( values, nodeType ) );

};
