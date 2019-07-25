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

NormalNode.prototype = Object.create( TempNode.prototype );
NormalNode.prototype.constructor = NormalNode;
NormalNode.prototype.nodeType = "Normal";

NormalNode.prototype.getUnique = function () {

	// if unique is true, TempNode will not create temp variable (for optimization)

	return this.scope === NormalNode.LOCAL;

};

NormalNode.prototype.generate = function ( builder, output ) {

	var result;

	switch ( this.scope ) {

		case NormalNode.LOCAL:

			result = 'normal';

			break;

		case NormalNode.WORLD:

			if ( builder.isShader( 'vertex' ) ) {

				result = '( modelMatrix * vec4( objectNormal, 0.0 ) ).xyz';

			} else {

				result = 'inverseTransformDirection( normal, viewMatrix )';

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

NodeLib.addKeyword( 'normal', function () {

	return new NormalNode();

} );

NodeLib.addKeyword( 'worldNormal', function () {

	return new NormalNode( NormalNode.WORLD );

} );

export { NormalNode };
