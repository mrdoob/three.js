import { Color } from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode.js';
import { NodeUtils } from '../core/NodeUtils.js';

function ColorNode( color, g, b ) {

	InputNode.call( this, 'c' );

	this.value = color instanceof Color ? color : new Color( color || 0, g, b );

}

ColorNode.prototype = Object.create( InputNode.prototype );
ColorNode.prototype.constructor = ColorNode;
ColorNode.prototype.nodeType = "Color";

NodeUtils.addShortcuts( ColorNode.prototype, 'value', [ 'r', 'g', 'b' ] );

ColorNode.prototype.generateReadonly = function ( builder, output, uuid, type/*, ns, needsUpdate */ ) {

	return builder.format( "vec3( " + this.r + ", " + this.g + ", " + this.b + " )", type, output );

};

ColorNode.prototype.copy = function ( source ) {

	InputNode.prototype.copy.call( this, source );

	this.value.copy( source );

	return this;

};

ColorNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.r = this.r;
		data.g = this.g;
		data.b = this.b;

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};

export { ColorNode };
