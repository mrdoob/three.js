import { TempNode } from '../core/TempNode.js';

class SubSlotNode extends TempNode {

	constructor( slots ) {

		super();

		this.slots = slots || {};

	}

	getType( builder, output ) {

		return output;

	}

	generate( builder, output ) {

		if ( this.slots[ builder.slot ] ) {

			return this.slots[ builder.slot ].build( builder, output );

		}

		return builder.format( '0.0', 'f', output );

	}

	copy( source ) {

		super.copy( source );

		for ( const prop in source.slots ) {

			this.slots[ prop ] = source.slots[ prop ];

		}

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.slots = {};

			for ( const prop in this.slots ) {

				const slot = this.slots[ prop ];

				if ( slot ) {

					data.slots[ prop ] = slot.toJSON( meta ).uuid;

				}

			}

		}

		return data;

	}

}

SubSlotNode.prototype.nodeType = 'SubSlot';

export { SubSlotNode };
