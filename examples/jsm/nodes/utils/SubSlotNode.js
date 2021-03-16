import { TempNode } from '../core/TempNode.js';

function SubSlotNode( slots ) {

	TempNode.call( this );

	this.slots = slots || {};

}

SubSlotNode.prototype = Object.create( TempNode.prototype );
SubSlotNode.prototype.constructor = SubSlotNode;
SubSlotNode.prototype.nodeType = 'SubSlot';

SubSlotNode.prototype.getType = function ( builder, output ) {

	return output;

};

SubSlotNode.prototype.generate = function ( builder, output ) {

	if ( this.slots[ builder.slot ] ) {

		return this.slots[ builder.slot ].build( builder, output );

	}

	return builder.format( '0.0', 'f', output );

};

SubSlotNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	for ( var prop in source.slots ) {

		this.slots[ prop ] = source.slots[ prop ];

	}

	return this;

};

SubSlotNode.prototype.toJSON = function ( meta ) {

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

};

export { SubSlotNode };
