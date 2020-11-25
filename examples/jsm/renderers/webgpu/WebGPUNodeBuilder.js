import WebGPUUniformsGroup from './WebGPUUniformsGroup.js';
import { FloatUniform, Vector3Uniform } from './WebGPUUniform.js';

import NodeSlot from '../nodes/core/NodeSlot.js';
import NodeBuilder from '../nodes/core/NodeBuilder.js';

class WebGPUNodeUniformsGroup extends WebGPUUniformsGroup {

	constructor( shaderStage ) {

		super( 'nodeUniforms' );

		let shaderStageVisibility;

		if ( shaderStage === 'vertex' ) shaderStageVisibility = GPUShaderStage.VERTEX;
		else if ( shaderStage === 'fragment' ) shaderStageVisibility = GPUShaderStage.FRAGMENT;

		this.setVisibility( shaderStageVisibility );

		//this.setOnBeforeUpdate( this._onBeforeUpdate );

	}
	/*
	_onBeforeUpdate( object, camera ) {

		const material = object.material;

	}
	*/

}

class WebGPUNodeBuilder extends NodeBuilder {

	constructor( material, renderer ) {

		super( material, renderer );

		this.uniformsGroup = {};

		this._parseMaterial();

	}

	_parseMaterial() {

		const material = this.material;

		if ( material.isMeshBasicMaterial || material.isPointsMaterial ) {

			if ( material.colorNode !== undefined ) {

				this.addSlot( 'fragment', new NodeSlot( material.colorNode, 'COLOR', 'vec3' ) );

			}

			if ( material.opacityNode !== undefined ) {

				this.addSlot( 'fragment', new NodeSlot( material.opacityNode, 'OPACITY', 'float' ) );

			}

		}

	}

	getUniformNSName( nodeUniform ) {

		return `nodeUniforms.${nodeUniform.name}`;

	}

	getBindings() {

		const bindings = [];

		const uniformsVertexGroup = this.uniformsGroup[ 'vertex' ];
		const uniformsFragmentGroup = this.uniformsGroup[ 'fragment' ];

		if ( uniformsVertexGroup ) bindings.push( uniformsVertexGroup );
		if ( uniformsFragmentGroup ) bindings.push( uniformsFragmentGroup );

		return bindings;

	}

	getUniformFromNode( node, shaderStage, type ) {

		const uniformNode = super.getUniformFromNode( node, shaderStage, type );
		const nodeData = this.getDataFromNode( node, shaderStage );

		if ( nodeData.uniformGroup === undefined ) {

			let uniformsGroup = this.uniformsGroup[ shaderStage ];

			if ( uniformsGroup === undefined ) {

				uniformsGroup = new WebGPUNodeUniformsGroup( shaderStage );

				this.uniformsGroup[ shaderStage ] = uniformsGroup;

			}

			let uniformGroup;

			if ( type === 'float' ) {

				uniformGroup = new FloatUniform( uniformNode.name, uniformNode.value );

			} else if ( type === 'vec3' ) {

				uniformGroup = new Vector3Uniform( uniformNode.name, uniformNode.value );

			} else {

				console.error( `Uniform "${type}" not declared.` );

			}

			uniformsGroup.addUniform( uniformGroup );

			nodeData.uniformGroup = uniformGroup;

		}

		return uniformNode;

	}

	buildShader( shaderStage, code ) {

		// use regex maybe for security?
		const versionStrIndex = code.indexOf( "\n" );

		let finalCode = code.substr( 0, versionStrIndex ) + "\n\n";

		const shaderCodes = this.build( shaderStage );

		finalCode += shaderCodes.defines;

		finalCode += code.substr( versionStrIndex );

		return finalCode;

	}

	parse( vertexShader, fragmentShader ) {

		vertexShader = this.buildShader( 'vertex', vertexShader );
		fragmentShader = this.buildShader( 'fragment', fragmentShader );

		return {
			vertexShader,
			fragmentShader
		};

	}

}

export default WebGPUNodeBuilder;
