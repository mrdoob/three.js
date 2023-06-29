import InputNode from '../core/InputNode.js';
import { addNodeClass } from '../core/Node.js';
import { varying } from '../core/VaryingNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { InterleavedBufferAttribute, InterleavedBuffer, StaticDrawUsage, DynamicDrawUsage } from 'three';

class BufferAttributeNode extends InputNode {

	constructor( value, bufferType, bufferStride = 0, bufferOffset = 0 ) {

		super( value, bufferType );

		this.isBufferNode = true;

		this.bufferType = bufferType;
		this.bufferStride = bufferStride;
		this.bufferOffset = bufferOffset;

		this.usage = StaticDrawUsage;
		this.instanced = false;

	}

	construct( builder ) {

		const type = this.getNodeType( builder );
		const array = this.value;
		const itemSize = builder.getTypeLength( type );
		const stride = this.bufferStride || itemSize;
		const offset = this.bufferOffset;

		const buffer = new InterleavedBuffer( array, stride );
		const bufferAttribute = new InterleavedBufferAttribute( buffer, itemSize, offset );

		buffer.setUsage( this.usage );

		this.attribute = bufferAttribute;
		this.attribute.isInstancedBufferAttribute = this.instanced; // @TODO: Add a possible: InstancedInterleavedBufferAttribute

	}

	generate( builder ) {

		const nodeType = this.getNodeType( builder );

		const nodeUniform = builder.getBufferAttributeFromNode( this, nodeType );
		const propertyName = builder.getPropertyName( nodeUniform );

		let output = null;

		if ( builder.shaderStage === 'vertex' ) {

			output = propertyName;

		} else {

			const nodeVarying = varying( this );

			output = nodeVarying.build( builder, nodeType );

		}

		return output;

	}

	getInputType( /*builder*/ ) {

		return 'bufferAttribute';

	}

	setUsage( value ) {

		this.usage = value;

		return this;

	}

	setInstanced( value ) {

		this.instanced = value;

		return this;

	}

}

export default BufferAttributeNode;

export const bufferAttribute = ( array, type, stride, offset ) => nodeObject( new BufferAttributeNode( array, type, stride, offset ) );
export const dynamicBufferAttribute = ( array, type, stride, offset ) => bufferAttribute( array, type, stride, offset ).setUsage( DynamicDrawUsage );

export const instancedBufferAttribute = ( array, type, stride, offset ) => bufferAttribute( array, type, stride, offset ).setInstanced( true );
export const instancedDynamicBufferAttribute = ( array, type, stride, offset ) => dynamicBufferAttribute( array, type, stride, offset ).setInstanced( true );

addNodeClass( BufferAttributeNode );
