import { TempNode } from '../core/TempNode.js';
import { NodeUtils } from '../core/NodeUtils.js';

const inputs = NodeUtils.elements;

class JoinNode extends TempNode {

	constructor( x, y, z, w ) {

		super( 'f' );

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

	}

	getNumElements() {

		let i = inputs.length;

		while ( i -- ) {

			if ( this[ inputs[ i ] ] !== undefined ) {

				++ i;

				break;

			}

		}

		return Math.max( i, 2 );

	}

	getType( builder ) {

		return builder.getTypeFromLength( this.getNumElements() );

	}

	generate( builder, output ) {

		const type = this.getType( builder ),
			length = this.getNumElements(),
			outputs = [];

		for ( let i = 0; i < length; i ++ ) {

			const elm = this[ inputs[ i ] ];

			outputs.push( elm ? elm.build( builder, 'f' ) : '0.0' );

		}

		const code = ( length > 1 ? builder.getConstructorFromLength( length ) : '' ) + '( ' + outputs.join( ', ' ) + ' )';

		return builder.format( code, type, output );

	}

	copy( source ) {

		super.copy( source );

		for ( const prop in source.inputs ) {

			this[ prop ] = source.inputs[ prop ];

		}

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.inputs = {};

			const length = this.getNumElements();

			for ( let i = 0; i < length; i ++ ) {

				const elm = this[ inputs[ i ] ];

				if ( elm ) {

					data.inputs[ inputs[ i ] ] = elm.toJSON( meta ).uuid;

				}

			}


		}

		return data;

	}

}

JoinNode.prototype.nodeType = 'Join';

export { JoinNode };
