import WebGPUNodeUniformsGroup from './WebGPUNodeUniformsGroup.js';
import {
	FloatNodeUniform, Vector2NodeUniform, Vector3NodeUniform, Vector4NodeUniform,
	ColorNodeUniform, Matrix3NodeUniform, Matrix4NodeUniform
} from './WebGPUNodeUniform.js';
import WebGPUSampler from '../WebGPUSampler.js';
import { WebGPUSampledTexture } from '../WebGPUSampledTexture.js';

import NodeSlot from '../../nodes/core/NodeSlot.js';
import NodeBuilder from '../../nodes/core/NodeBuilder.js';
import ModelViewProjectionNode from '../../nodes/accessors/ModelViewProjectionNode.js';

import ShaderLib from './ShaderLib.js';

class WebGPUNodeBuilder extends NodeBuilder {

	constructor( material, renderer ) {

		super( material, renderer );

		this.bindings = { vertex: [], fragment: [] };
		this.bindingsOffset = { vertex: 0, fragment: 0 };

		this.uniformsGroup = {};

		this.nativeShader = null;

		this._parseMaterial();

	}

	_parseMaterial() {

		const material = this.material;

		// get shader

		this.nativeShader = ShaderLib.common;

		// parse inputs

		if ( material.isMeshBasicMaterial || material.isPointsMaterial || material.isLineBasicMaterial ) {

			const mvpNode = new ModelViewProjectionNode();

			if ( material.positionNode !== undefined ) {

				mvpNode.position = material.positionNode;

			}

			this.addSlot( 'vertex', new NodeSlot( mvpNode, 'MVP', 'vec4' ) );

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

	getPropertyName( node ) {

		if ( node.isNodeUniform ) {

			const name = node.name;
			const type = node.type;

			if ( type === 'texture' ) {

				return name;

			} else {

				return `nodeUniforms.${name}`;

			}

		}

		return super.getPropertyName( node );

	}

	getBindings() {

		const bindings = this.bindings;

		return [ ...bindings.vertex, ...bindings.fragment ];

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

				} else if ( type === 'mat3' ) {

					uniformGPU = new Matrix3NodeUniform( uniformNode );

				} else if ( type === 'mat4' ) {

					uniformGPU = new Matrix4NodeUniform( uniformNode );

				} else {

					throw new Error( `Uniform "${type}" not declared.` );

				}

				uniformsGroup.addUniform( uniformGPU );

			}

			nodeData.uniformGPU = uniformGPU;

			if ( shaderStage === 'vertex' ) {

				this.bindingsOffset[ 'fragment' ] = bindings.length;

			}

		}

		return uniformNode;

	}

	getAttributesHeaderSnippet( shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' ) {

			const attributes = this.attributes;

			for ( let index = 0; index < attributes.length; index ++ ) {

				const attribute = attributes[ index ];

				snippet += `layout(location = ${index}) in ${attribute.type} ${attribute.name};`;

			}

		}

		return snippet;

	}

	getVarysHeaderSnippet( shaderStage ) {

		let snippet = '';

		const varys = this.varys;

		const ioStage = shaderStage === 'vertex' ? 'out' : 'in';

		for ( let index = 0; index < varys.length; index ++ ) {

			const vary = varys[ index ];

			snippet += `layout(location = ${index}) ${ioStage} ${vary.type} ${vary.name};`;

		}

		return snippet;

	}

	getVarysBodySnippet( shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' ) {

			for ( const vary of this.varys ) {

				snippet += `${vary.name} = ${vary.snippet};`;

			}

		}

		return snippet;

	}

	getUniformsHeaderSnippet( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		let snippet = '';
		let groupSnippet = '';

		let index = this.bindingsOffset[ shaderStage ];

		for ( const uniform of uniforms ) {

			if ( uniform.type === 'texture' ) {

				snippet += `layout(set = 0, binding = ${index ++}) uniform sampler ${uniform.name}_sampler;`;
				snippet += `layout(set = 0, binding = ${index ++}) uniform texture2D ${uniform.name};`;

			} else {

				const vectorType = this.getVectorType( uniform.type );

				groupSnippet += `uniform ${vectorType} ${uniform.name};`;

			}

		}

		if ( groupSnippet ) {

			snippet += `layout(set = 0, binding = ${index ++}) uniform NodeUniforms { ${groupSnippet} } nodeUniforms;`;

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
