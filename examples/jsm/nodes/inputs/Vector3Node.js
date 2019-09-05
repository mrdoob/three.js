/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Vector3 } from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode.js';
import { NodeUtils } from '../core/NodeUtils.js';

export class Vector3Node extends InputNode {

	constructor( x, y, z ) {

		super( 'v3' );

		this.value = x instanceof Vector3 ? x : new Vector3( x, y, z );

		this.nodeType = "Vector3";

	}

	generateConst( builder, output, uuid, type ) {

		return builder.format( "vec3( " + this.x + ", " + this.y + ", " + this.z + " )", type, output );

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

			data.x = this.x;
			data.y = this.y;
			data.z = this.z;

			if ( this.readonly === true ) data.readonly = true;

		}

		return data;

	}

}

NodeUtils.addShortcuts( Vector3Node.prototype, 'value', [ 'x', 'y', 'z' ] );
