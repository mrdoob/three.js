import WebGPUNodeUniformsGroup from './WebGPUNodeUniformsGroup.js';
import { FloatNodeUniform, Vector2NodeUniform, Vector3NodeUniform, Vector4NodeUniform, ColorNodeUniform } from './WebGPUNodeUniform.js';
import WebGPUSampler from '../WebGPUSampler.js';
import { WebGPUSampledTexture } from '../WebGPUSampledTexture.js';

import NodeSlot from '../../nodes/core/NodeSlot.js';
import NodeBuilder from '../../nodes/core/NodeBuilder.js';

import ShaderLib from './ShaderLib.js';

class WebGPUNodeBuilder extends NodeBuilder {

	constructor( material, renderer ) {

		super( material, renderer );

		this.bindingIndex = 2;
		this.bindings = { vertex: [], fragment: [] };

		this.attributeIndex = 1;
		this.varyIndex = 0;

		this.uniformsGroup = {};

		this.nativeShader = null;

		this._parseMaterial();

	}

	_parseMaterial() {

		const material = this.material;

		// get shader

		if ( material.isMeshBasicMaterial ) {

			this.nativeShader = ShaderLib.meshBasic;

		} else if ( material.isPointsMaterial ) {

			this.nativeShader = ShaderLib.pointsBasic;

		} else if ( material.isLineBasicMaterial ) {

			this.nativeShader = ShaderLib.lineBasic;

		} else {

			console.error( 'THREE.WebGPURenderer: Unknwon shader type.' );

		}

		// parse inputs

		if ( material.isMeshBasicMaterial || material.isPointsMaterial || material.isLineBasicMaterial ) {

			if ( material.colorNode !== undefined ) {

				this.addSlot( 'fragment', new NodeSlot( material.colorNode, 'COLOR', 'vec4' ) );

			}

			if ( material.opacityNode !== undefined ) {

				this.addSlot( 'fragment', new NodeSlot( material.opacityNode, 'OPACITY', 'float' ) );

			}

		}

	}

	getTexture( textureProperty, uvSnippet ) {

		return `texture( sampler2D( ${textureProperty}, ${textureProperty}_sampler ), ${uvSnippet} )`;

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

		if ( nodeData.uniformGPU === undefined ) {

			let uniformGPU;

			const bindings = this.bindings[ shaderStage ];

			if ( type === 'texture' ) {

				const sampler = new WebGPUSampler( `${uniformNode.name}_sampler`, uniformNode.value );
				const texture = new WebGPUSampledTexture( uniformNode.name, uniformNode.value );

				// add first textures in sequence and group for last
				const lastBinding = bindings[ bindings.length - 1 ];
				const index = lastBinding && lastBinding.isUniformsGroup ? bindings.length - 1 : bindings.length;

				bindings.splice( index, 0, sampler, texture );

				uniformGPU = { sampler, texture };

			} else {

				let uniformsGroup = this.uniformsGroup[ shaderStage ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new WebGPUNodeUniformsGroup( shaderStage );

					this.uniformsGroup[ shaderStage ] = uniformsGroup;

					bindings.push( uniformsGroup );

				}

				if ( type === 'float' ) {

					uniformGPU = new FloatNodeUniform( uniformNode );

				} else if ( type === 'vec2' ) {

					uniformGPU = new Vector2NodeUniform( uniformNode );

				} else if ( type === 'vec3' ) {

					uniformGPU = new Vector3NodeUniform( uniformNode );

				} else if ( type === 'vec4' ) {

					uniformGPU = new Vector4NodeUniform( uniformNode );

				} else if ( type === 'color' ) {

					uniformGPU = new ColorNodeUniform( uniformNode );

				} else {

					throw new Error( `Uniform "${type}" not declared.` );

				}

				uniformsGroup.addUniform( uniformGPU );

			}

			nodeData.uniformGPU = uniformGPU;

		}

		return uniformNode;

	}

	getAttributesHeaderSnippet( shaderStage ) {

		let snippet = '';

		const attributes = this.attributes;

		let attributeIndex = this.attributeIndex;
		let varyIndex = this.varyIndex;

		for ( const name in attributes ) {

			const attribute = attributes[ name ];

			const type = attribute.type;
			const property = attribute.property;

			if ( shaderStage === 'vertex' ) {

				snippet += `layout(location = ${attributeIndex ++}) in ${type} ${name};`;
				snippet += `layout(location = ${varyIndex ++}) out ${type} ${property};`;

			} else if ( shaderStage === 'fragment' ) {

				snippet += `layout(location = ${varyIndex ++}) in ${type} ${property};`;

			}

		}

		return snippet;

	}

	getAttributesBodySnippet( /* shaderStage */ ) {

		let snippet = '';

		const attributes = this.attributes;

		for ( const name in attributes ) {

			const attribute = attributes[ name ];

			const property = attribute.property;

			snippet += `${property} = ${name};`;

		}

		return snippet;

	}

	getUniformsHeaderSnippet( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		let snippet = '';
		let groupSnippet = '';

		let bindingIndex = this.bindingIndex;

		for ( const uniform of uniforms ) {

			if ( uniform.type === 'texture' ) {

				snippet += `layout(set = 0, binding = ${bindingIndex ++}) uniform sampler ${uniform.name}_sampler;`;
				snippet += `layout(set = 0, binding = ${bindingIndex ++}) uniform texture2D ${uniform.name};`;

			} else {

				const vectorType = this.getVectorType( uniform.type );

				groupSnippet += `uniform ${vectorType} ${uniform.name};`;

			}

		}

		if ( groupSnippet ) {

			snippet += `layout(set = 0, binding = ${bindingIndex ++}) uniform NodeUniforms { ${groupSnippet} } nodeUniforms;`;

		}

		return snippet;

	}

	composeShaderCode( code, snippet ) {

		// use regex maybe for security?
		const versionStrIndex = code.indexOf( '\n' );

		let finalCode = code.substr( 0, versionStrIndex ) + '\n\n';

		finalCode += snippet;

		finalCode += code.substr( versionStrIndex );

		return finalCode;

	}

	build() {

		super.build();

		this.vertexShader = this.composeShaderCode( this.nativeShader.vertexShader, this.vertexShader );
		this.fragmentShader = this.composeShaderCode( this.nativeShader.fragmentShader, this.fragmentShader );

		return this;

	}

}

export default WebGPUNodeBuilder;
