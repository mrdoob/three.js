/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';

function ReflectNode( scope ) {

	TempNode.call( this, 'v3', { unique: true } );

	this.scope = scope || ReflectNode.CUBE;

}

ReflectNode.CUBE = 'cube';
ReflectNode.SPHERE = 'sphere';
ReflectNode.VECTOR = 'vector';
ReflectNode.VECTOR2 = 'vector2';

ReflectNode.prototype = Object.create( TempNode.prototype );
ReflectNode.prototype.constructor = ReflectNode;
ReflectNode.prototype.nodeType = "Reflect";

ReflectNode.prototype.getType = function ( builder ) {

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

				builder.addNodeCode( 'vec3 reflectVec = inverseTransformDirection( reflect( -normalize( vViewPosition ), normal ), viewMatrix );' );

				result = 'reflectVec';

				break;

			case ReflectNode.VECTOR2:

				builder.addNodeCode( 'vec3 reflectVec2 = vec3( inverseTransformDirection( geometry.normal, viewMatrix ).x, inverseTransformDirection( geometry.normal, viewMatrix ).yz );' );

				result = 'reflectVec2';

				break;

			case ReflectNode.CUBE:

				var reflectVec = new ReflectNode( ReflectNode.VECTOR ).build( builder, 'v3' );

				builder.addNodeCode( 'vec3 reflectCubeVec = vec3( -1.0 * ' + reflectVec + '.x, ' + reflectVec + '.yz );' );

				result = 'reflectCubeVec';

				break;

			case ReflectNode.SPHERE:

				var reflectVec = new ReflectNode( ReflectNode.VECTOR ).build( builder, 'v3' );

				builder.addNodeCode( 'vec2 reflectSphereVec = normalize( ( viewMatrix * vec4( ' + reflectVec + ', 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) ).xy * 0.5 + 0.5;' );

				result = 'reflectSphereVec';

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
