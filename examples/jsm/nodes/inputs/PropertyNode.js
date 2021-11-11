import { InputNode } from '../core/InputNode.js';

class PropertyNode extends InputNode {

	constructor( object, property, type ) {

		super( type );

		this.object = object;
		this.property = property;

	}

	get value() {

		return this.object[ this.property ];

	}

	set value( val ) {

		this.object[ this.property ] = val;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value;
			data.property = this.property;

		}

		return data;

	}

}

PropertyNode.prototype.nodeType = 'Property';

export { PropertyNode };
