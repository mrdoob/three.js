/**
 * @author sunag / http://www.sunag.com.br/
 */

import { ShaderChunk } from '../../../../build/three.module.js';

import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { MaxMIPLevelNode } from './MaxMIPLevelNode.js';
import { GLSLParser } from '../core/GLSLParser.js';

var getSpecularMIPLevelFunctionNode;

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

			getSpecularMIPLevelFunctionNode = getSpecularMIPLevelFunctionNode || new GLSLParser( ShaderChunk['envmap_physical_pars_fragment'] ).getNodeByName( 'getSpecularMIPLevel' );

			var getSpecularMIPLevel = builder.include( getSpecularMIPLevelFunctionNode );

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
