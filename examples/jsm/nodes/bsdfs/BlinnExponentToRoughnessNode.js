/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { BlinnShininessExponentNode } from './BlinnShininessExponentNode.js';

function BlinnExponentToRoughnessNode( blinnExponent ) {

	TempNode.call( this, 'f' );

	this.blinnExponent = blinnExponent || new BlinnShininessExponentNode();

}

BlinnExponentToRoughnessNode.prototype = Object.create( TempNode.prototype );
BlinnExponentToRoughnessNode.prototype.constructor = BlinnExponentToRoughnessNode;
BlinnExponentToRoughnessNode.prototype.nodeType = "BlinnExponentToRoughness";

BlinnExponentToRoughnessNode.prototype.generate = function ( builder, output ) {

	return builder.format( 'BlinnExponentToGGXRoughness( ' + this.blinnExponent.build( builder, 'f' ) + ' )', this.type, output );

};

BlinnExponentToRoughnessNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.blinnExponent = source.blinnExponent;

	return this;

};

BlinnExponentToRoughnessNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.blinnExponent = this.blinnExponent;

	}

	return data;

};

export { BlinnExponentToRoughnessNode };
