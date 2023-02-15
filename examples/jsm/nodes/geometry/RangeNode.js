import Node, { addNodeClass } from '../core/Node.js';
import { attribute } from '../core/AttributeNode.js';
import { nodeObject, float } from '../shadernode/ShaderNode.js';

import { MathUtils, InstancedBufferAttribute } from 'three';

class RangeNode extends Node {

	constructor( min, max ) {

		super();

		this.min = min;
		this.max = max;

	}

	getVectorLength() {

		const min = this.min;

		let length = 1;

		if ( min.isVector2 ) length = 2;
		else if ( min.isVector3 || min.isColor ) length = 3;
		else if ( min.isVector4 ) length = 4;

		return length;

	}

	getNodeType( builder ) {

		return builder.object.isInstancedMesh === true ? builder.getTypeFromLength( this.getVectorLength() ) : 'float';

	}

	construct( builder ) {

		const { min, max } = this;
		const { object, geometry } = builder;

		let output = null;

		if ( object.isInstancedMesh === true ) {

			const vectorLength = this.getVectorLength();
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

export const range = ( min, max ) => nodeObject( new RangeNode( min, max ) );

addNodeClass( RangeNode );
