import WebGPUNodeUniformsGroup from './WebGPUNodeUniformsGroup.js';
import {
	FloatNodeUniform, Vector2NodeUniform, Vector3NodeUniform, Vector4NodeUniform,
	ColorNodeUniform, Matrix3NodeUniform, Matrix4NodeUniform
} from './WebGPUNodeUniform.js';
import WebGPUNodeSampler from './WebGPUNodeSampler.js';
import { WebGPUNodeSampledTexture } from './WebGPUNodeSampledTexture.js';

import { getVectorLength, getStrideLength } from '../WebGPUBufferUtils.js';

import NodeSlot from '../../nodes/core/NodeSlot.js';
import VarNode from '../../nodes/core/VarNode.js';
import NodeBuilder from '../../nodes/core/NodeBuilder.js';
import MaterialNode from '../../nodes/accessors/MaterialNode.js';
import NormalNode from '../../nodes/accessors/NormalNode.js';
import ModelViewProjectionNode from '../../nodes/accessors/ModelViewProjectionNode.js';
import LightContextNode from '../../nodes/lights/LightContextNode.js';
import ShaderLib from './ShaderLib.js';

class WebGPUNodeBuilder extends NodeBuilder {

	constructor( material, renderer, lightNode = null ) {

		super( material, renderer );

		this.lightNode = lightNode;

		this.bindings = { vertex: [], fragment: [] };
		this.bindingsOffset = { vertex: 0, fragment: 0 };

		this.uniformsGroup = {};

		this.nativeShader = null;

		this._parseMaterial();

	}

	_parseMaterial() {

		const material = this.material;

		// get shader

		let shader = null;

		if ( material.isMeshStandardMaterial ) {

			shader = ShaderLib.standard;

		} else {

			shader = ShaderLib.common;

		}

		this.nativeShader = shader;

		// parse inputs

		if ( material.isMeshStandardMaterial || material.isMeshPhongMaterial || material.isMeshBasicMaterial || material.isPointsMaterial || material.isLineBasicMaterial ) {

			const mvpNode = new ModelViewProjectionNode();

			let lightNode = material.lightNode;

			if ( lightNode === undefined && this.lightNode && this.lightNode.hasLights === true ) {

				lightNode = this.lightNode;

			}

			if ( material.positionNode !== undefined ) {

				mvpNode.position = material.positionNode;

			}

			this.addSlot( 'vertex', new NodeSlot( mvpNode, 'MVP', 'vec4' ) );

			if ( material.alphaTestNode !== undefined ) {

				this.addSlot( 'fragment', new NodeSlot( material.alphaTestNode, 'ALPHA_TEST', 'float' ) );

			} else {

				this.addSlot( 'fragment', new NodeSlot( new MaterialNode( MaterialNode.ALPHA_TEST ), 'ALPHA_TEST', 'float' ) );

			}

			if ( material.colorNode !== undefined ) {

				this.addSlot( 'fragment', new NodeSlot( material.colorNode, 'COLOR', 'vec4' ) );

			} else {

				this.addSlot( 'fragment', new NodeSlot( new MaterialNode( MaterialNode.COLOR ), 'COLOR', 'vec4' ) );

			}

			if ( material.opacityNode !== undefined ) {

				this.addSlot( 'fragment', new NodeSlot( material.opacityNode, 'OPACITY', 'float' ) );

			} else {

				this.addSlot( 'fragment', new NodeSlot( new MaterialNode( MaterialNode.OPACITY ), 'OPACITY', 'float' ) );

			}

			if ( material.isMeshStandardMaterial ) {

				if ( material.metalnessNode !== undefined ) {

					this.addSlot( 'fragment', new NodeSlot( material.metalnessNode, 'METALNESS', 'float' ) );

				} else {

					this.addSlot( 'fragment', new NodeSlot( new MaterialNode( MaterialNode.METALNESS ), 'METALNESS', 'float' ) );

				}

				if ( material.roughnessNode !== undefined ) {

					this.addSlot( 'fragment', new NodeSlot( material.roughnessNode, 'ROUGHNESS', 'float' ) );

				} else {

					this.addSlot( 'fragment', new NodeSlot( new MaterialNode( MaterialNode.ROUGHNESS ), 'ROUGHNESS', 'float' ) );

				}

				let normalNode = null;

				if ( material.normalNode !== undefined ) {

					normalNode = material.normalNode;

				} else {

					normalNode = new NormalNode( NormalNode.VIEW );

				}

				this.addSlot( 'fragment', new NodeSlot( new VarNode( normalNode, 'TransformedNormalView', 'vec3' ), 'NORMAL', 'vec3' ) );

			} else if ( material.isMeshPhongMaterial ) {

				if ( material.specularNode !== undefined ) {

					this.addSlot( 'fragment', new NodeSlot( material.specularNode, 'SPECULAR', 'vec3' ) );

				} else {

					this.addSlot( 'fragment', new NodeSlot( new MaterialNode( MaterialNode.SPECULAR ), 'SPECULAR', 'vec3' ) );

				}

				if ( material.shininessNode !== undefined ) {

					this.addSlot( 'fragment', new NodeSlot( material.shininessNode, 'SHININESS', 'float' ) );

				} else {

					this.addSlot( 'fragment', new NodeSlot( new MaterialNode( MaterialNode.SHININESS ), 'SHININESS', 'float' ) );

				}

			}

			if ( lightNode && lightNode.isNode ) {

				const lightContextNode = new LightContextNode( lightNode );

				this.addSlot( 'fragment', new NodeSlot( lightContextNode, 'LIGHT', 'vec3' ) );

			}

		}

	}

	getTexture( textureProperty, uvSnippet, biasSnippet = null ) {

		if ( biasSnippet !== null ) {

			return `texture( sampler2D( ${textureProperty}, ${textureProperty}_sampler ), ${uvSnippet}, ${biasSnippet} )`;

		} else {

			return `texture( sampler2D( ${textureProperty}, ${textureProperty}_sampler ), ${uvSnippet} )`;

		}

	}

	getPropertyName( node ) {

		if ( node.isNodeUniform === true ) {

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

				const sampler = new WebGPUNodeSampler( `${uniformNode.name}_sampler`, uniformNode.node );
				const texture = new WebGPUNodeSampledTexture( uniformNode.name, uniformNode.node );

				// add first textures in sequence and group for last
				const lastBinding = bindings[ bindings.length - 1 ];
				const index = lastBinding && lastBinding.isUniformsGroup ? bindings.length - 1 : bindings.length;

				bindings.splice( index, 0, sampler, texture );

				uniformGPU = [ sampler, texture ];

			} else {

				let uniformsGroup = this.uniformsGroup[ shaderStage ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new WebGPUNodeUniformsGroup( shaderStage );

					this.uniformsGroup[ shaderStage ] = uniformsGroup;

					bindings.push( uniformsGroup );

				}

				if ( node.isArrayInputNode === true ) {

					uniformGPU = [];

					console.log( );

					for ( const inputNode of node.value ) {

						const uniformNodeGPU = this._getNodeUniform( inputNode, type );

						// fit bounds to buffer
						uniformNodeGPU.boundary = getVectorLength( uniformNodeGPU.itemSize );
						uniformNodeGPU.itemSize = getStrideLength( uniformNodeGPU.itemSize );

						uniformsGroup.addUniform( uniformNodeGPU );

						uniformGPU.push( uniformNodeGPU );

					}

				} else {

					uniformGPU = this._getNodeUniform( uniformNode, type );

					uniformsGroup.addUniform( uniformGPU );

				}

			}

			nodeData.uniformGPU = uniformGPU;

			if ( shaderStage === 'vertex' ) {

				this.bindingsOffset[ 'fragment' ] = bindings.length;

			}

		}

		return uniformNode;

	}

	getAttributes( shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' ) {

			const attributes = this.attributes;

			for ( let index = 0; index < attributes.length; index ++ ) {

				const attribute = attributes[ index ];

				snippet += `layout(location = ${index}) in ${attribute.type} ${attribute.name}; `;

			}

		}

		return snippet;

	}

	getVarys( shaderStage ) {

		let snippet = '';

		const varys = this.varys;

		const ioStage = shaderStage === 'vertex' ? 'out' : 'in';

		for ( let index = 0; index < varys.length; index ++ ) {

			const vary = varys[ index ];

			snippet += `layout(location = ${index}) ${ioStage} ${vary.type} ${vary.name}; `;

		}

		return snippet;

	}

	getUniforms( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		let snippet = '';
		let groupSnippet = '';

		let index = this.bindingsOffset[ shaderStage ];

		for ( const uniform of uniforms ) {

			if ( uniform.type === 'texture' ) {

				snippet += `layout(set = 0, binding = ${index ++}) uniform sampler ${uniform.name}_sampler; `;
				snippet += `layout(set = 0, binding = ${index ++}) uniform texture2D ${uniform.name}; `;

			} else {

				const vectorType = this.getVectorType( uniform.type );

				if ( Array.isArray( uniform.value ) === true ) {

					const length = uniform.value.length;

					groupSnippet += `uniform ${vectorType}[ ${length} ] ${uniform.name}; `;

				} else {

					groupSnippet += `uniform ${vectorType} ${uniform.name}; `;

				}

			}

		}

		if ( groupSnippet ) {

			snippet += `layout(set = 0, binding = ${index ++}) uniform NodeUniforms { ${groupSnippet} } nodeUniforms; `;

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

		const keywords = this.getContextValue( 'keywords' );

		for ( const shaderStage of [ 'vertex', 'fragment' ] ) {

			this.shaderStage = shaderStage;

			keywords.include( this, this.nativeShader.fragmentShader );

		}

		super.build();

		this.vertexShader = this.composeShaderCode( this.nativeShader.vertexShader, this.vertexShader );
		this.fragmentShader = this.composeShaderCode( this.nativeShader.fragmentShader, this.fragmentShader );

		return this;

	}

	_getNodeUniform( uniformNode, type ) {

		if ( type === 'float' ) return new FloatNodeUniform( uniformNode );
		if ( type === 'vec2' ) return new Vector2NodeUniform( uniformNode );
		if ( type === 'vec3' ) return new Vector3NodeUniform( uniformNode );
		if ( type === 'vec4' ) return new Vector4NodeUniform( uniformNode );
		if ( type === 'color' ) return new ColorNodeUniform( uniformNode );
		if ( type === 'mat3' ) return new Matrix3NodeUniform( uniformNode );
		if ( type === 'mat4' ) return new Matrix4NodeUniform( uniformNode );

		throw new Error( `Uniform "${type}" not declared.` );

	}

}

export default WebGPUNodeBuilder;
