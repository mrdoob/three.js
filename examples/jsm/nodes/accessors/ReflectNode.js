/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NormalNode } from './NormalNode.js';

function ReflectNode( scope, normal ) {

	TempNode.call( this, 'v3' );

	this.scope = scope || ReflectNode.CUBE;
	this.normal = normal || new NormalNode();

}

ReflectNode.CUBE = 'cube';
ReflectNode.SPHERE = 'sphere';
ReflectNode.VECTOR = 'vector';

ReflectNode.prototype = Object.create( TempNode.prototype );
ReflectNode.prototype.constructor = ReflectNode;
ReflectNode.prototype.nodeType = "Reflect";

ReflectNode.prototype.getType = function ( /* builder */ ) {

	switch ( this.scope ) {

		case ReflectNode.SPHERE:

			return 'v2';

	}

	return this.type;

};

ReflectNode.prototype.generate = function ( builder, output ) {

	if ( builder.isShader( 'fragment' ) ) {

		var result;

		switch ( this.scope ) {

			case ReflectNode.VECTOR:

				var normal = this.normal.build( builder, 'v3' );
				
				result = 'inverseTransformDirection( reflect( -normalize( vViewPosition ), ' + normal + ' ), viewMatrix )';

				break;

			case ReflectNode.CUBE:

				var reflectVec = new ReflectNode( ReflectNode.VECTOR, this.normal ).build( builder, 'v3' );

				result = 'vec3( -1.0 * ' + reflectVec + '.x, ' + reflectVec + '.yz )';

				break;

			case ReflectNode.SPHERE:

				var reflectVec = new ReflectNode( ReflectNode.VECTOR, this.normal ).build( builder, 'v3' );

				result = 'normalize( ( viewMatrix * vec4( ' + reflectVec + ', 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) ).xy * 0.5 + 0.5';

				break;

		}

		return builder.format( result, this.getType( builder ), output );

	} else {

		console.warn( "THREE.ReflectNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec3( 0.0 )', this.type, output );

	}

};

ReflectNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.scope = this.scope;

	}

	return data;

};

export { ReflectNode };
