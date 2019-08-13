/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { MaxMIPLevelNode } from '../utils/MaxMIPLevelNode.js';
import { BlinnShininessExponentNode } from './BlinnShininessExponentNode.js';

function RoughnessToBlinnExponentNode( texture ) {

	TempNode.call( this, 'f' );

	this.texture = texture;

	this.maxMIPLevel = new MaxMIPLevelNode( texture );
	this.blinnShininessExponent = new BlinnShininessExponentNode();

}

RoughnessToBlinnExponentNode.Nodes = ( function () {

	var getSpecularMIPLevel = new FunctionNode( [
		// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
		"float getSpecularMIPLevel( const in float blinnShininessExponent, const in float maxMIPLevelScalar ) {",

		//	float envMapWidth = pow( 2.0, maxMIPLevelScalar );
		//	float desiredMIPLevel = log2( envMapWidth * sqrt( 3.0 ) ) - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );

		"	float desiredMIPLevel = maxMIPLevelScalar + 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );",

		// clamp to allowable LOD ranges.
		"	return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );",

		"}"
	].join( "\n" ) );

	return {
		getSpecularMIPLevel: getSpecularMIPLevel
	};

} )();

RoughnessToBlinnExponentNode.prototype = Object.create( TempNode.prototype );
RoughnessToBlinnExponentNode.prototype.constructor = RoughnessToBlinnExponentNode;
RoughnessToBlinnExponentNode.prototype.nodeType = "RoughnessToBlinnExponent";

RoughnessToBlinnExponentNode.prototype.generate = function ( builder, output ) {

	if ( builder.isShader( 'fragment' ) ) {

		this.maxMIPLevel.texture = this.texture;

		var getSpecularMIPLevel = builder.include( RoughnessToBlinnExponentNode.Nodes.getSpecularMIPLevel );

		return builder.format( getSpecularMIPLevel + '( ' + this.blinnShininessExponent.build( builder, 'f' ) + ', ' + this.maxMIPLevel.build( builder, 'f' ) + ' )', this.type, output );

	} else {

		console.warn( "THREE.RoughnessToBlinnExponentNode is not compatible with " + builder.shader + " shader." );

		return builder.format( '0.0', this.type, output );

	}

};

RoughnessToBlinnExponentNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.texture = source.texture;

	return this;

};

RoughnessToBlinnExponentNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.texture = this.texture;

	}

	return data;

};

export { RoughnessToBlinnExponentNode };
