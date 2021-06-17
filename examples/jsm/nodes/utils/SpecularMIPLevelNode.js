import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { MaxMIPLevelNode } from './MaxMIPLevelNode.js';

class SpecularMIPLevelNode extends TempNode {

	constructor( roughness, texture ) {

		super( 'f' );

		this.roughness = roughness;
		this.texture = texture;

		this.maxMIPLevel = undefined;

	}

	setTexture( texture ) {

		this.texture = texture;

		return this;

	}

	generate( builder, output ) {

		if ( builder.isShader( 'fragment' ) ) {

			this.maxMIPLevel = this.maxMIPLevel || new MaxMIPLevelNode();
			this.maxMIPLevel.texture = this.texture;

			const getSpecularMIPLevel = builder.include( SpecularMIPLevelNode.Nodes.getSpecularMIPLevel );

			return builder.format( getSpecularMIPLevel + '( ' + this.roughness.build( builder, 'f' ) + ', ' + this.maxMIPLevel.build( builder, 'f' ) + ' )', this.type, output );

		} else {

			console.warn( 'THREE.SpecularMIPLevelNode is not compatible with ' + builder.shader + ' shader.' );

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

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.texture = this.texture;
			data.roughness = this.roughness;

		}

		return data;

	}

}

SpecularMIPLevelNode.Nodes = ( function () {

	// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html

	const getSpecularMIPLevel = new FunctionNode( /* glsl */`

		float getSpecularMIPLevel( const in float roughness, const in float maxMIPLevelScalar ) {

			float sigma = PI * roughness * roughness / ( 1.0 + roughness );
			float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

			return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

		}`
	);

	return {
		getSpecularMIPLevel: getSpecularMIPLevel
	};

} )();

SpecularMIPLevelNode.prototype.nodeType = 'SpecularMIPLevel';

export { SpecularMIPLevelNode };
