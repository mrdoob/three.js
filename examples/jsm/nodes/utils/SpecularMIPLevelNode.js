/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { MaxMIPLevelNode } from './MaxMIPLevelNode.js';

export const GET_SPECULAR_MIP_LEVEL = new FunctionNode( [
	// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
	"float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {",

	"	float maxMIPLevelScalar = float( maxMIPLevel );",

	"	float sigma = PI * roughness * roughness / ( 1.0 + roughness );",
	"	float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );",

		// clamp to allowable LOD ranges.
	"	return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );",

	"}"
].join( "\n" ) );

export class SpecularMIPLevelNode extends TempNode {

	constructor( roughness, texture ) {

		super( 'f' );

		this.roughness = roughness;
		this.texture = texture;

		this.maxMIPLevel = undefined;

		this.nodeType = "SpecularMIPLevel";

	}

	setTexture( texture ) {

		this.texture = texture;

		return this;

	}

	generate( builder, output ) {

		if ( builder.isShader( 'fragment' ) ) {

			this.maxMIPLevel = this.maxMIPLevel || new MaxMIPLevelNode();
			this.maxMIPLevel.texture = this.texture;

			var getSpecularMIPLevel = builder.include( GET_SPECULAR_MIP_LEVEL );

			return builder.format( getSpecularMIPLevel + '( ' + this.roughness.build( builder, 'f' ) + ', ' + this.maxMIPLevel.build( builder, 'i' ) + ' )', this.type, output );

		} else {

			console.warn( "THREE.SpecularMIPLevelNode is not compatible with " + builder.shader + " shader." );

			return builder.format( '0.0', this.type, output );

		}

	}

	copy( source ) {

		super.copy( source );

		this.texture = source.texture;
		this.roughness = source.roughness;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.texture = this.texture;
			data.roughness = this.roughness;

		}

		return data;

	}

}
