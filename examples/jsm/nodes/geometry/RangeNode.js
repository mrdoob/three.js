import Node, { addNodeClass } from '../core/Node.js';
import { getValueType } from '../core/NodeUtils.js';
import { buffer } from '../accessors/BufferNode.js';
import { instancedBufferAttribute } from '../accessors/BufferAttributeNode.js';
import { instanceIndex } from '../core/IndexNode.js';
import { nodeProxy, float } from '../shadernode/ShaderNode.js';

import { Vector4, MathUtils, InstancedBufferAttribute } from 'three';

let min = null;
let max = null;

class RangeNode extends Node {

	constructor( minNode = float(), maxNode = float() ) {

		super();

		this.minNode = minNode;
		this.maxNode = maxNode;

	}

	getVectorLength( builder ) {

		const minLength = builder.getTypeLength( getValueType( this.minNode.value ) );
		const maxLength = builder.getTypeLength( getValueType( this.maxNode.value ) );

		return minLength > maxLength ? minLength : maxLength;

	}

	getNodeType( builder ) {

		return builder.object.count > 1 ? builder.getTypeFromLength( this.getVectorLength( builder ) ) : 'float';

	}

	setup( builder ) {

		const object = builder.object;

		let output = null;

		if ( object.count > 1 ) {

			const minValue = this.minNode.value;
			const maxValue = this.maxNode.value;

			const minLength = builder.getTypeLength( getValueType( minValue ) );
			const maxLength = builder.getTypeLength( getValueType( maxValue ) );

			min = min || new Vector4();
			max = max || new Vector4();

			min.setScalar( 0 );
			max.setScalar( 0 );

			if ( minLength === 1 ) min.setScalar( minValue );
			else if ( minValue.isColor ) min.set( minValue.r, minValue.g, minValue.b );
			else min.set( minValue.x, minValue.y, minValue.z || 0, minValue.w || 0 );

			if ( maxLength === 1 ) max.setScalar( maxValue );
			else if ( maxValue.isColor ) max.set( maxValue.r, maxValue.g, maxValue.b );
			else max.set( maxValue.x, maxValue.y, maxValue.z || 0, maxValue.w || 0 );

			const stride = 4;

			const length = stride * object.count;
			const array = new Float32Array( length );

			for ( let i = 0; i < length; i ++ ) {

				const index = i % stride;

				const minElementValue = min.getComponent( index );
				const maxElementValue = max.getComponent( index );

				array[ i ] = MathUtils.lerp( minElementValue, maxElementValue, Math.random() );

			}

			const nodeType = this.getNodeType( builder );

			if ( object.count <= 4096 ) {

				output = buffer( array, 'vec4', object.count ).element( instanceIndex ).convert( nodeType );

			} else {

				// TODO: Improve anonymous buffer attribute creation removing this part
				const bufferAttribute = new InstancedBufferAttribute( array, 4 );
				builder.geometry.setAttribute( '__range' + this.id, bufferAttribute );

				output = instancedBufferAttribute( bufferAttribute ).convert( nodeType );

			}

		} else {

			output = float( 0 );

		}

		return output;

	}

}

export default RangeNode;

export const range = nodeProxy( RangeNode );

addNodeClass( 'RangeNode', RangeNode );
