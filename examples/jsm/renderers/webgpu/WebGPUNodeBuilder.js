import WebGPUUniformsGroup from './WebGPUUniformsGroup.js';
import { FloatUniform, Vector3Uniform } from './WebGPUUniform.js';
import WebGPUSampler from './WebGPUSampler.js';
import { WebGPUSampledTexture } from './WebGPUSampledTexture.js';

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

		this.bindingIndex = 2;
		this.bindings = { vertex: [], fragment: [] };

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

	getTexture( textureSnippet, uvSnippet ) {
		
		return `texture( sampler2D( ${textureSnippet}, ${textureSnippet}_sampler ), ${uvSnippet} )`;
		
	}

	getPropertyName( nodeUniform ) {

		if ( nodeUniform.type === 'texture' ) {

			return nodeUniform.name;
			
		} else {
			
			return `nodeUniforms.${nodeUniform.name}`;
			
		}

	}

	getBindings( shaderStage ) {

		return this.bindings[ shaderStage ];

	}

	getUniformFromNode( node, shaderStage, type ) {

		const uniformNode = super.getUniformFromNode( node, shaderStage, type );
		const nodeData = this.getDataFromNode( node, shaderStage );

		if ( nodeData.webgpuUniform === undefined ) {

			let uniform;

			if ( type === 'texture' ) {
				
				const sampler = new WebGPUSampler( `${uniformNode.name}_sampler`, uniformNode.value );
				const texture = new WebGPUSampledTexture( uniformNode.name, uniformNode.value );
				
				// Array.unshift: add first textures in sequence
				
				this.bindings[ shaderStage ].unshift( sampler, texture );
				
			} else {

				let uniformsGroup = this.uniformsGroup[ shaderStage ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new WebGPUNodeUniformsGroup( shaderStage );

					this.uniformsGroup[ shaderStage ] = uniformsGroup;

					this.bindings[ shaderStage ].push( uniformsGroup );

				}

				if ( type === 'float' ) {

					uniform = new FloatUniform( uniformNode );

				} else if ( type === 'vec3' ) {

					uniform = new Vector3Uniform( uniformNode.name, uniformNode.value );

				} else {

					throw new Error( `Uniform "${type}" not declared.` );

				}

				uniformsGroup.addUniform( uniform );

			}
			
			nodeData.webgpuUniform = uniform;

		}

		return uniformNode;

	}

	getUniformsOutput( shaderStage ) {
		
		const uniforms = this.uniforms[ shaderStage ];
		
		let uniformsCode = '';
		let uniformGroupCode = '';
		
		let bindingIndex = this.bindingIndex;

		for ( let uniform of uniforms ) {

			if (uniform.type === 'texture') {

				uniformsCode += `layout(set = 0, binding = ${bindingIndex++}) uniform sampler ${uniform.name}_sampler;`;
				uniformsCode += `layout(set = 0, binding = ${bindingIndex++}) uniform texture2D ${uniform.name};`;

			} else {
		
				if (!uniformGroupCode) {
					
					uniformGroupCode = `layout(set = 0, binding = ${bindingIndex++}) uniform NodeUniforms {`;
					
				}
				
				uniformGroupCode += `uniform ${uniform.type} ${uniform.name};`;
				
			}

		}
		
		if (uniformGroupCode) {
			
			uniformGroupCode += `} nodeUniforms;`;
			
			uniformsCode += uniformGroupCode;
			
		}
		
		console.log( uniformsCode );
		
		return uniformsCode;
		
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
