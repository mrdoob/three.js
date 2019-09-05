/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';

export class SubSlotNode extends TempNode {

	constructor( slots ) {

		super();

		this.slots = slots || {};

		this.nodeType = "SubSlot";

	}

	getType( builder, output ) {

		return output;

	}

	generate( builder, output ) {

		if ( this.slots[ builder.slot ] ) {

			return this.slots[ builder.slot ].build( builder, output )

		}

		return builder.format( '0.0', 'f', output );

	}

	copy( source ) {

		super.copy( source );

		for ( var prop in source.slots ) {

			this.slots[ prop ] = source.slots[ prop ];

		}

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.slots = {};

			for ( var prop in this.slots ) {

				var slot = this.slots[ prop ];

				if ( slot ) {

					data.slots[ prop ] = slot.toJSON( meta ).uuid;

				}

			}

		}

		return data;

	}

}
