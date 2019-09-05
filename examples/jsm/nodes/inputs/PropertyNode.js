/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';

export class PropertyNode extends InputNode {

	constructor( object, property, type ) {

		super( type );

		this.object = object;
		this.property = property;

		this.nodeType = "Property";

	}

	set value( val ) {
		
		this.object[ this.property ] = val;
		
	}
	
	get value() {
		
		return this.object[ this.property ];
		
	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value;
			data.property = this.property;

		}

		return data;

	}

}
