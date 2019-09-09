/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Node } from '../core/Node.js';
import { NodeLib } from '../core/NodeLib.js';

export class SwitchNode extends Node {

	constructor( node, components ) {

		super();

		this.node = NodeLib.resolve( node );
		this.components = components || 'x';

		this.nodeType = "Switch";

	}

	getType( builder ) {

		return builder.getTypeFromLength( this.components.length );

	}

	generate( builder, output ) {

		var type = this.node.getType( builder ),
			node = this.node.build( builder, type ),
			inputLength = builder.getTypeLength( type ) - 1;

		if ( inputLength > 0 ) {

			// get max length

			var outputLength = 0,
				components = builder.colorToVectorProperties( this.components );

			var i, len = components.length;

			for ( i = 0; i < len; i ++ ) {

				outputLength = Math.max( outputLength, builder.getIndexByElement( components.charAt( i ) ) );

			}

			if ( outputLength > inputLength ) outputLength = inputLength;

			// split

			node += '.';

			for ( i = 0; i < len; i ++ ) {

				var elm = components.charAt( i );
				var idx = builder.getIndexByElement( components.charAt( i ) );

				if ( idx > outputLength ) idx = outputLength;

				node += builder.getElementByIndex( idx );

			}

			return builder.format( node, this.getType( builder ), output );

		} else {

			// join

			return builder.format( node, type, output );

		}

	}

	copy( source ) {

		super.copy( source );

		this.node = source.node;
		this.components = source.components;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.node = this.node.toJSON( meta ).uuid;
			data.components = this.components;

		}

		return data;

	}

}
