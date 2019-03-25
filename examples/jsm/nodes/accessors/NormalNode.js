/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NodeLib } from '../core/NodeLib.js';

function NormalNode( scope ) {

	TempNode.call( this, 'v3' );

	this.scope = scope || NormalNode.LOCAL;

}

NormalNode.LOCAL = 'local';
NormalNode.WORLD = 'world';
NormalNode.VIEW = 'view';

NormalNode.prototype = Object.create( TempNode.prototype );
NormalNode.prototype.constructor = NormalNode;
NormalNode.prototype.nodeType = "Normal";

NormalNode.prototype.getShared = function ( builder ) {

	switch ( this.scope ) {

		case NormalNode.WORLD:

			return true;

	}

	return false;

};

NormalNode.prototype.generate = function ( builder, output ) {

	var result;

	switch ( this.scope ) {

		case NormalNode.LOCAL:

			builder.requires.normal = true;

			result = 'normal';

			break;

		case NormalNode.WORLD:

			builder.requires.worldNormal = true;

			result = builder.isShader( 'vertex' ) ? '( modelMatrix * vec4( objectNormal, 0.0 ) ).xyz' : 'vWNormal';

			break;

		case NormalNode.VIEW:

			result = 'vNormal';

			break;

	}

	return builder.format( result, this.getType( builder ), output );

};

NormalNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.scope = source.scope;

};

NormalNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.scope = this.scope;

	}

	return data;

};

NodeLib.addKeyword( 'normal', function () {

	return new NormalNode();

} );

NodeLib.addKeyword( 'worldNormal', function () {

	return new NormalNode( NormalNode.WORLD );

} );

NodeLib.addKeyword( 'viewNormal', function () {

	return new NormalNode( NormalNode.VIEW );

} );

export { NormalNode };
