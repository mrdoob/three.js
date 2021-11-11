import { Node } from '../core/Node.js';

class SwitchNode extends Node {

	constructor( node, components ) {

		super();

		this.node = node;
		this.components = components || 'x';

	}

	getType( builder ) {

		return builder.getTypeFromLength( this.components.length );

	}

	generate( builder, output ) {

		const type = this.node.getType( builder ),
			inputLength = builder.getTypeLength( type ) - 1;

		let node = this.node.build( builder, type );

		if ( inputLength > 0 ) {

			// get max length

			let outputLength = 0;
			const components = builder.colorToVectorProperties( this.components );

			let i;
			const len = components.length;

			for ( i = 0; i < len; i ++ ) {

				outputLength = Math.max( outputLength, builder.getIndexByElement( components.charAt( i ) ) );

			}

			if ( outputLength > inputLength ) outputLength = inputLength;

			// split

			node += '.';

			for ( i = 0; i < len; i ++ ) {

				let idx = builder.getIndexByElement( components.charAt( i ) );

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

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.node = this.node.toJSON( meta ).uuid;
			data.components = this.components;

		}

		return data;

	}

}

SwitchNode.prototype.nodeType = 'Switch';

export { SwitchNode };
