/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NodeLib } from '../core/NodeLib.js';

function NormalNode( scope ) {

	TempNode.call( this, 'v3' );

	this.scope = scope || NormalNode.VIEW;

}

NormalNode.LOCAL = 'local';
NormalNode.WORLD = 'world';
NormalNode.VIEW = 'view';

NormalNode.prototype = Object.create( TempNode.prototype );
NormalNode.prototype.constructor = NormalNode;
NormalNode.prototype.nodeType = "Normal";

NormalNode.prototype.getShared = function () {

	// if shared is false, TempNode will not create temp variable (for optimization)

	return this.scope === NormalNode.WORLD;

};

NormalNode.prototype.generate = function ( builder, output ) {

	var result;

	switch ( this.scope ) {

		case NormalNode.VIEW:

			if ( builder.isShader( 'vertex' ) ) result = 'transformedNormal';
			else result = 'geometryNormal';

			break;

		case NormalNode.LOCAL:

			if ( builder.isShader( 'vertex' ) ) {

				result = 'objectNormal';

			} else {

				builder.requires.normal = true;

				result = 'vObjectNormal';

			}

			break;

		case NormalNode.WORLD:

			if ( builder.isShader( 'vertex' ) ) {

				result = 'inverseTransformDirection( transformedNormal, viewMatrix ).xyz';

			} else {

				builder.requires.worldNormal = true;

				result = 'vWNormal';

			}

			break;

	}

	return builder.format( result, this.getType( builder ), output );

};

NormalNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.scope = source.scope;

	return this;

};

NormalNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.scope = this.scope;

	}

	return data;

};

NodeLib.addKeyword( 'viewNormal', function () {

	return new NormalNode( NormalNode.VIEW );

} );

NodeLib.addKeyword( 'localNormal', function () {

	return new NormalNode( NormalNode.NORMAL );

} );

NodeLib.addKeyword( 'worldNormal', function () {

	return new NormalNode( NormalNode.WORLD );

} );

export { NormalNode };
