/**
 * @author sunag / http://www.sunag.com.br/
 */

import { 
	MeshStandardMaterial,
	ShaderChunk
} from '../../../../build/three.module.js';

import { NodeBuilder } from '../core/NodeBuilder.js';
import { NativeNode } from './nodes/NativeNode.js';

function parseIncludes( source ) {

	function replace( match, include ) {

		var replace = ShaderChunk[ include ];

		if ( replace === undefined ) {

			throw new Error( 'Can not resolve #include <' + include + '>' );

		}

		return parseIncludes( replace );

	}

	return source.replace( /^[ \t]*#include +<([\w./]+)>/gm, replace );

}

function MeshStandardNodeMaterial() {

	MeshStandardMaterial.call( this );

	this.onBeforeCompile = function ( shader, renderer ) {

		var materialProperties = renderer.properties.get( this );

		if ( this.version !== materialProperties.__version ) {

			this.build( shader, renderer );

		}

	};

}

MeshStandardNodeMaterial.prototype = Object.create( MeshStandardMaterial.prototype );
MeshStandardNodeMaterial.prototype.constructor = MeshStandardNodeMaterial;
MeshStandardNodeMaterial.prototype.type = "MeshStandardNodeMaterial";

MeshStandardNodeMaterial.prototype.isShaderNodeMaterial = true;

MeshStandardNodeMaterial.prototype.build = function ( shader, renderer ) {
	
	const main = 'void main() {';
	
	var builder = new NodeBuilder();
	var nodes = new NativeNode( 'standard' );

	nodes.color = this.color;

	builder.setMaterial( this, renderer );
	builder.build( nodes, nodes );

	shader.uniforms = Object.assign( shader.uniforms, builder.uniforms );

	shader.vertexShader = parseIncludes( shader.vertexShader );
	shader.fragmentShader = parseIncludes( shader.fragmentShader );

	shader.fragmentShader = shader.fragmentShader.replace( 'uniform vec3 diffuse;', 'vec3 diffuse;' );
	//delete shader.uniforms.diffuse;

	var fragmentMainIndex = shader.fragmentShader.indexOf( main );
	
	shader.fragmentShader = 
		builder.getParsCode( 'fragment' ) + 
		shader.fragmentShader.substring( 0, fragmentMainIndex + main.length ) +
		builder.getMainCode( 'fragment' ) +
		shader.fragmentShader.substring( fragmentMainIndex + main.length );

}

export { MeshStandardNodeMaterial };
