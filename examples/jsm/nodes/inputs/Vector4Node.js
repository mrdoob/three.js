/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Vector4 } from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode.js';
import { NodeUtils } from '../core/NodeUtils.js';
import { NodeLib } from '../core/NodeLib.js';

export class Vector4Node extends InputNode {

	constructor( x, y, z, w ) {

		super( 'v4' );

		this.value = x instanceof Vector4 ? x : new Vector4( x, y, z, w );

		this.nodeType = "Vector4";

	}

	generateConst( builder, output, uuid, type ) {

		return builder.format( "vec4( " + this.x + ", " + this.y + ", " + this.z + ", " + this.w + " )", type, output );

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
			data.w = this.w;

			if ( this.constant === true ) data.constant = true;

		}

		return data;

	}

}

NodeUtils.addShortcuts( Vector4Node.prototype, 'value', [ 'x', 'y', 'z', 'w' ] );

NodeLib.addResolver( ( value ) => { if ( value.isVector4 ) return new Vector4Node( value ).setConst( true ); } );
