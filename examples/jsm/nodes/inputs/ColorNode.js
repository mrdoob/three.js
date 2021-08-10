import { Color } from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode.js';
import { NodeUtils } from '../core/NodeUtils.js';

class ColorNode extends InputNode {

	constructor( color, g, b ) {

		super( 'c' );

		this.value = color instanceof Color ? color : new Color( color || 0, g, b );

	}

	generateReadonly( builder, output, uuid, type/*, ns, needsUpdate */ ) {

		return builder.format( 'vec3( ' + this.r + ', ' + this.g + ', ' + this.b + ' )', type, output );

	}

	copy( source ) {

		super.copy( source );

		this.value.copy( source );

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.r = this.r;
			data.g = this.g;
			data.b = this.b;

			if ( this.readonly === true ) data.readonly = true;

		}

		return data;

	}

}

ColorNode.prototype.nodeType = 'Color';

NodeUtils.addShortcuts( ColorNode.prototype, 'value', [ 'r', 'g', 'b' ] );

export { ColorNode };
