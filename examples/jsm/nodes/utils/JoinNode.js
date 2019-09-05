/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NodeUtils } from '../core/NodeUtils.js';

var inputs = NodeUtils.elements;

export class JoinNode extends TempNode {

	constructor( x, y, z, w ) {

		super( 'f' );

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		this.nodeType = "Join";

	}

	getNumElements() {

		var i = inputs.length;

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

		var type = this.getType( builder ),
			length = this.getNumElements(),
			outputs = [];

		for ( var i = 0; i < length; i ++ ) {

			var elm = this[ inputs[ i ] ];

			outputs.push( elm ? elm.build( builder, 'f' ) : '0.0' );

		}

		var code = ( length > 1 ? builder.getConstructorFromLength( length ) : '' ) + '( ' + outputs.join( ', ' ) + ' )';

		return builder.format( code, type, output );

	};

	copy( source ) {

		super.copy( source );

		for ( var prop in source.inputs ) {

			this[ prop ] = source.inputs[ prop ];

		}

		return this;

	};

	toJSON ( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.inputs = {};

			var length = this.getNumElements();

			for ( var i = 0; i < length; i ++ ) {

				var elm = this[ inputs[ i ] ];

				if ( elm ) {

					data.inputs[ inputs[ i ] ] = elm.toJSON( meta ).uuid;

				}

			}


		}

		return data;

	}

}
