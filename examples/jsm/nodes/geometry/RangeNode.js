import Node, { addNodeClass } from '../core/Node.js';
import { getValueType } from '../core/NodeUtils.js';
import { attribute } from '../core/AttributeNode.js';
import { nodeProxy, float } from '../shadernode/ShaderNode.js';

import { MathUtils, InstancedBufferAttribute } from 'three';

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

		return builder.object.isInstancedMesh === true ? builder.getTypeFromLength( this.getVectorLength( builder ) ) : 'float';

	}

	construct( builder ) {

		const object = builder.object;

		let output = null;

		if ( object.isInstancedMesh === true ) {

			const geometry = builder.geometry;

			let min = this.minNode.value;
			let max = this.maxNode.value;

			const minLength = builder.getTypeLength( getValueType( min ) );
			const maxLength = builder.getTypeLength( getValueType( max ) );

				 if ( minLength > maxLength && maxLength > 1 ) max = new min.constructor().fromArray( min.toArray() );
			else if ( minLength > maxLength && maxLength === 1 ) max = new min.constructor().setScalar( max );
			else if ( maxLength > minLength && minLength > 1 ) min = new max.constructor().fromArray( min.toArray() );
			else if ( maxLength > minLength && minLength === 1 ) min = new max.constructor().setScalar( min );

			const vectorLength = this.getVectorLength( builder );
			const attributeName = 'node' + this.id;

			const length = vectorLength * object.count;
			const array = new Float32Array( length );

			const attributeGeometry = geometry.getAttribute( attributeName );

			if ( attributeGeometry === undefined || attributeGeometry.array.length < length ) {

				if ( vectorLength === 1 ) {

					for ( let i = 0; i < length; i ++ ) {

						array[ i ] = MathUtils.lerp( min, max, Math.random() );

					}

				} else if ( min.isColor ) {

					for ( let i = 0; i < length; i += 3 ) {

						array[ i ] = MathUtils.lerp( min.r, max.r, Math.random() );
						array[ i + 1 ] = MathUtils.lerp( min.g, max.g, Math.random() );
						array[ i + 2 ] = MathUtils.lerp( min.b, max.b, Math.random() );

					}

				} else {

					for ( let i = 0; i < length; i ++ ) {

						const index = i % vectorLength;

						const minValue = min.getComponent( index );
						const maxValue = max.getComponent( index );

						array[ i ] = MathUtils.lerp( minValue, maxValue, Math.random() );

					}

				}

				geometry.setAttribute( attributeName, new InstancedBufferAttribute( array, vectorLength ) );

				geometry.dispose();

			}

			output = attribute( attributeName, builder.getTypeFromLength( vectorLength ) );

		} else {

			output = float( 0 );

		}

		return output;

	}

}

export default RangeNode;

export const range = nodeProxy( RangeNode );

addNodeClass( RangeNode );
