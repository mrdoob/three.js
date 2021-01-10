import WebGPUNodeUniformsGroup from './WebGPUNodeUniformsGroup.js';
import { FloatNodeUniform, Vector2NodeUniform, Vector3NodeUniform, Vector4NodeUniform } from './WebGPUNodeUniform.js';
import WebGPUSampler from '../WebGPUSampler.js';
import { WebGPUSampledTexture } from '../WebGPUSampledTexture.js';

import NodeSlot from '../../nodes/core/NodeSlot.js';
import NodeBuilder from '../../nodes/core/NodeBuilder.js';

class WebGPUNodeBuilder extends NodeBuilder {

	constructor( material, renderer ) {

		super( material, renderer );

		this.bindingIndex = 2;
		this.bindings = { vertex: [], fragment: [] };

		this.attributeIndex = 1;
		this.varyIndex = 0;

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

					uniform = new FloatNodeUniform( uniformNode );

				} else if ( type === 'vec2' ) {

					uniform = new Vector2NodeUniform( uniformNode );

				} else if ( type === 'vec3' ) {

					uniform = new Vector3NodeUniform( uniformNode );

				} else if ( type === 'vec4' ) {

					uniform = new Vector4NodeUniform( uniformNode );

				} else {

					throw new Error( `Uniform "${type}" not declared.` );

				}

				uniformsGroup.addUniform( uniform );

			}
			
			nodeData.webgpuUniform = uniform;

		}

		return uniformNode;

	}

	getAttributesHeaderSnippet( shaderStage ) {
		
		let snippet = '';
		
		const attributes = this.attributes;
		
		let attributeIndex = this.attributeIndex;
		let varyIndex = this.varyIndex;

		for ( let name in attributes ) {			

			let attribute = attributes[ name ];
			
			let type = attribute.type;
			let property = attribute.property;

			if ( shaderStage === 'vertex' ) {
				
				snippet += `layout(location = ${attributeIndex++}) in ${type} ${name};`;
				snippet += `layout(location = ${varyIndex++}) out ${type} ${property};`;
				
			} else if ( shaderStage === 'fragment' ) {
				
				snippet += `layout(location = ${varyIndex++}) in ${type} ${property};`;
				
			}

		}
		
		return snippet;
		
	}

	getAttributesBodySnippet( shaderStage ) {
		
		let snippet = '';
		
		const attributes = this.attributes;
		
		for ( let name in attributes ) {			

			let attribute = attributes[ name ];

			let property = attribute.property;

			snippet += `${property} = ${name};`;

		}
		
		return snippet;
		
	}
	

	getUniformsHeaderSnippet( shaderStage ) {
		
		const uniforms = this.uniforms[ shaderStage ];
		
		let snippet = '';
		let groupSnippet = '';
		
		let bindingIndex = this.bindingIndex;

		for ( let uniform of uniforms ) {

			if (uniform.type === 'texture') {

				snippet += `layout(set = 0, binding = ${bindingIndex++}) uniform sampler ${uniform.name}_sampler;`;
				snippet += `layout(set = 0, binding = ${bindingIndex++}) uniform texture2D ${uniform.name};`;

			} else {
		
				if (!groupSnippet) {
					
					groupSnippet = `layout(set = 0, binding = ${bindingIndex++}) uniform NodeUniforms {`;
					
				}
				
				groupSnippet += `uniform ${uniform.type} ${uniform.name};`;
				
			}

		}
		
		if (groupSnippet) {
			
			groupSnippet += `} nodeUniforms;`;
			
			snippet += groupSnippet;
			
		}
		
		return snippet;
		
	}

	buildShader( code, snippet ) {

		// use regex maybe for security?
		const versionStrIndex = code.indexOf( "\n" );

		let finalCode = code.substr( 0, versionStrIndex ) + "\n\n";

		finalCode += snippet;

		finalCode += code.substr( versionStrIndex );

		return finalCode;

	}

	parse( vertexShader, fragmentShader ) {
		
		const shader = this.build();

		vertexShader = this.buildShader( vertexShader, shader.vertex );
		fragmentShader = this.buildShader( fragmentShader, shader.fragment );

		return {
			vertexShader,
			fragmentShader
		};

	}

}

export default WebGPUNodeBuilder;
