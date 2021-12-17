import { LinearEncoding } from 'three';

import WebGPUNodeUniformsGroup from './WebGPUNodeUniformsGroup.js';
import {
	FloatNodeUniform, Vector2NodeUniform, Vector3NodeUniform, Vector4NodeUniform,
	ColorNodeUniform, Matrix3NodeUniform, Matrix4NodeUniform
} from './WebGPUNodeUniform.js';
import WebGPUNodeSampler from './WebGPUNodeSampler.js';
import { WebGPUNodeSampledTexture } from './WebGPUNodeSampledTexture.js';

import WebGPUUniformBuffer from '../WebGPUUniformBuffer.js';
import { getVectorLength, getStrideLength } from '../WebGPUBufferUtils.js';

import VarNode from '../../nodes/core/VarNode.js';
import CodeNode from '../../nodes/core/CodeNode.js';
import BypassNode from '../../nodes/core/BypassNode.js';
import ExpressionNode from '../../nodes/core/ExpressionNode.js';
import NodeBuilder from '../../nodes/core/NodeBuilder.js';
import MaterialNode from '../../nodes/accessors/MaterialNode.js';
import PositionNode from '../../nodes/accessors/PositionNode.js';
import NormalNode from '../../nodes/accessors/NormalNode.js';
import ModelViewProjectionNode from '../../nodes/accessors/ModelViewProjectionNode.js';
import SkinningNode from '../../nodes/accessors/SkinningNode.js';
import ColorSpaceNode from '../../nodes/display/ColorSpaceNode.js';
import LightContextNode from '../../nodes/lights/LightContextNode.js';
import OperatorNode from '../../nodes/math/OperatorNode.js';
import WGSLNodeParser from '../../nodes/parsers/WGSLNodeParser.js';
import { vec4 } from '../../nodes/ShaderNode.js';
import { getRoughness } from '../../nodes/functions/PhysicalMaterialFunctions.js';

const wgslTypeLib = {
	float: 'f32',
	int: 'i32',
	vec2: 'vec2<f32>',
	vec3: 'vec3<f32>',
	vec4: 'vec4<f32>',
	uvec4: 'vec4<u32>',
	bvec3: 'vec3<bool>',
	mat3: 'mat3x3<f32>',
	mat4: 'mat4x4<f32>'
};

const wgslMethods = {
	dFdx: 'dpdx',
	dFdy: 'dpdy'
};

const wgslPolyfill = {
	lessThanEqual: new CodeNode( `
fn lessThanEqual( a : vec3<f32>, b : vec3<f32> ) -> vec3<bool> {

	return vec3<bool>( a.x <= b.x, a.y <= b.y, a.z <= b.z );

}
` ),
	mod: new CodeNode( `
fn mod( x : f32, y : f32 ) -> f32 {

	return x - y * floor( x / y );

}
` ),
	repeatWrapping: new CodeNode( `
fn repeatWrapping( uv : vec2<f32>, dimension : vec2<i32> ) -> vec2<i32> {

	let uvScaled = vec2<i32>( uv * vec2<f32>( dimension ) );

	return ( ( uvScaled % dimension ) + dimension ) % dimension;

}
` ),
	inversesqrt: new CodeNode( `
fn inversesqrt( x : f32 ) -> f32 {

	return 1.0 / sqrt( x );

}
` )
};

class WebGPUNodeBuilder extends NodeBuilder {

	constructor( object, renderer, lightNode = null ) {

		super( object, renderer, new WGSLNodeParser() );

		this.lightNode = lightNode;

		this.bindings = { vertex: [], fragment: [] };
		this.bindingsOffset = { vertex: 0, fragment: 0 };

		this.uniformsGroup = {};

		this._parseObject();

	}

	_parseObject() {

		const object = this.object;
		const material = this.material;

		// parse inputs

		if ( material.isMeshStandardMaterial || material.isMeshBasicMaterial || material.isPointsMaterial || material.isLineBasicMaterial ) {

			let lightNode = material.lightNode;

			// VERTEX STAGE

			let vertex = new PositionNode( PositionNode.GEOMETRY );

			if ( lightNode === null && this.lightNode && this.lightNode.hasLights === true ) {

				lightNode = this.lightNode;

			}

			if ( material.positionNode && material.positionNode.isNode ) {

				const assignPositionNode = new OperatorNode( '=', new PositionNode( PositionNode.LOCAL ), material.positionNode );

				vertex = new BypassNode( vertex, assignPositionNode );

			}

			if ( object.isSkinnedMesh === true ) {

				vertex = new BypassNode( vertex, new SkinningNode( object ) );

			}

			this.context.vertex = vertex;

			this.addFlow( 'vertex', new VarNode( new ModelViewProjectionNode(), 'MVP', 'vec4' ) );

			// COLOR

			let colorNode = null;

			if ( material.colorNode && material.colorNode.isNode ) {

				colorNode = material.colorNode;

			} else {

				colorNode = new MaterialNode( MaterialNode.COLOR );

			}

			colorNode = this.addFlow( 'fragment', new VarNode( colorNode, 'Color', 'vec4' ) );

			this.addFlow( 'fragment', new VarNode( colorNode, 'DiffuseColor', 'vec4' ) );

			// OPACITY

			let opacityNode = null;

			if ( material.opacityNode && material.opacityNode.isNode ) {

				opacityNode = material.opacityNode;

			} else {

				opacityNode = new VarNode( new MaterialNode( MaterialNode.OPACITY ) );

			}

			this.addFlow( 'fragment', new VarNode( opacityNode, 'OPACITY', 'float' ) );

			this.addFlow( 'fragment', new ExpressionNode( 'DiffuseColor.a = DiffuseColor.a * OPACITY;' ) );

			// ALPHA TEST

			let alphaTest = null;

			if ( material.alphaTestNode && material.alphaTestNode.isNode ) {

				alphaTest = material.alphaTestNode;

			} else if ( material.alphaTest > 0 ) {

				alphaTest = new MaterialNode( MaterialNode.ALPHA_TEST );

			}

			if ( alphaTest !== null ) {

				this.addFlow( 'fragment', new VarNode( alphaTest, 'AlphaTest', 'float' ) );

				this.addFlow( 'fragment', new ExpressionNode( 'if ( DiffuseColor.a <= AlphaTest ) { discard; }' ) );

			}

			if ( material.isMeshStandardMaterial ) {

				// METALNESS

				let metalnessNode = null;

				if ( material.metalnessNode && material.metalnessNode.isNode ) {

					metalnessNode = material.metalnessNode;

				} else {

					metalnessNode = new MaterialNode( MaterialNode.METALNESS );

				}

				this.addFlow( 'fragment', new VarNode( metalnessNode, 'Metalness', 'float' ) );

				this.addFlow( 'fragment', new ExpressionNode( 'DiffuseColor = vec4<f32>( DiffuseColor.rgb * ( 1.0 - Metalness ), DiffuseColor.a );' ) );

				// ROUGHNESS

				let roughnessNode = null;

				if ( material.roughnessNode && material.roughnessNode.isNode ) {

					roughnessNode = material.roughnessNode;

				} else {

					roughnessNode = new MaterialNode( MaterialNode.ROUGHNESS );

				}

				roughnessNode = getRoughness( { roughness: roughnessNode } );

				this.addFlow( 'fragment', new VarNode( roughnessNode, 'Roughness', 'float' ) );

				// SPECULAR_TINT

				this.addFlow( 'fragment', new VarNode( new ExpressionNode( 'mix( vec3<f32>( 0.04 ), Color.rgb, Metalness )', 'vec3' ), 'SpecularColor', 'color' ) );

				// NORMAL_VIEW

				let normalNode = null;

				if ( material.normalNode && material.normalNode.isNode ) {

					normalNode = material.normalNode;

				} else {

					normalNode = new NormalNode( NormalNode.VIEW );

				}

				this.addFlow( 'fragment', new VarNode( normalNode, 'TransformedNormalView', 'vec3' ) );

			}

			// LIGHT

			let outputNode = colorNode;

			if ( lightNode && lightNode.isNode ) {

				const lightContextNode = new LightContextNode( lightNode );

				outputNode = this.addFlow( 'fragment', new VarNode( lightContextNode, 'Light', 'vec3' ) );

			}

			// RESULT

			const outputEncoding = this.renderer.outputEncoding;

			if ( outputEncoding !== LinearEncoding ) {

				outputNode = new ColorSpaceNode( ColorSpaceNode.LINEAR_TO_LINEAR, vec4( outputNode ) );
				outputNode.fromEncoding( outputEncoding );

			}

			this.addFlow( 'fragment', new VarNode( outputNode, 'Output', 'vec4' ) );

		}

	}

	addFlowCode( code ) {

		if ( ! /;\s*$/.test( code ) ) {

			code += ';';

		}

		super.addFlowCode( code + '\n\t' );

	}

	getTexture( textureProperty, uvSnippet, biasSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSample( ${textureProperty}, ${textureProperty}_sampler, ${uvSnippet} )`;

		} else {

			this._include( 'repeatWrapping' );

			const dimension = `textureDimensions( ${textureProperty}, 0 )`;

			return `textureLoad( ${textureProperty}, repeatWrapping( ${uvSnippet}, ${dimension} ), 0 )`;

		}

	}

	getPropertyName( node, shaderStage = this.shaderStage ) {

		if ( node.isNodeVary === true ) {

			if ( shaderStage === 'vertex' ) {

				return `NodeVarys.${ node.name }`;

			}

		} else if ( node.isNodeUniform === true ) {

			const name = node.name;
			const type = node.type;

			if ( type === 'texture' ) {

				return name;

			} else if ( type === 'buffer' ) {

				return `NodeBuffer.${name}`;

			} else {

				return `NodeUniforms.${name}`;

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

				if ( shaderStage === 'fragment' ) {

					bindings.splice( index, 0, sampler, texture );

					uniformGPU = [ sampler, texture ];

				} else {

					bindings.splice( index, 0, texture );

					uniformGPU = [ texture ];


				}


			} else if ( type === 'buffer' ) {

				const buffer = new WebGPUUniformBuffer( 'NodeBuffer', node.value );

				// add first textures in sequence and group for last
				const lastBinding = bindings[ bindings.length - 1 ];
				const index = lastBinding && lastBinding.isUniformsGroup ? bindings.length - 1 : bindings.length;

				bindings.splice( index, 0, buffer );

				uniformGPU = buffer;

			} else {

				let uniformsGroup = this.uniformsGroup[ shaderStage ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new WebGPUNodeUniformsGroup( shaderStage );

					this.uniformsGroup[ shaderStage ] = uniformsGroup;

					bindings.push( uniformsGroup );

				}

				if ( node.isArrayInputNode === true ) {

					uniformGPU = [];

					for ( const inputNode of node.nodes ) {

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
			const length = attributes.length;

			snippet += '\n';

			for ( let index = 0; index < length; index ++ ) {

				const attribute = attributes[ index ];
				const name = attribute.name;
				const type = this.getType( attribute.type );

				snippet += `\t[[ location( ${index} ) ]] ${ name } : ${ type }`;

				if ( index + 1 < length ) {

					snippet += ',\n';

				}

			}

			snippet += '\n';

		}

		return snippet;

	}

	getVars( shaderStage ) {

		let snippet = '';

		const vars = this.vars[ shaderStage ];

		for ( let index = 0; index < vars.length; index ++ ) {

			const variable = vars[ index ];

			const name = variable.name;
			const type = this.getType( variable.type );

			snippet += `var ${name} : ${type}; `;

		}

		return snippet;

	}

	getVarys( shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' ) {

			snippet += '\t[[ builtin( position ) ]] Vertex: vec4<f32>;\n';

			const varys = this.varys;

			for ( let index = 0; index < varys.length; index ++ ) {

				const vary = varys[ index ];

				snippet += `\t[[ location( ${index} ) ]] ${ vary.name } : ${ this.getType( vary.type ) };\n`;

			}

			snippet = this._getWGSLStruct( 'NodeVarysStruct', snippet );

		} else if ( shaderStage === 'fragment' ) {

			const varys = this.varys;

			snippet += '\n';

			for ( let index = 0; index < varys.length; index ++ ) {

				const vary = varys[ index ];

				snippet += `\t[[ location( ${index} ) ]] ${ vary.name } : ${ this.getType( vary.type ) }`;

				if ( index + 1 < varys.length ) {

					snippet += ',\n';

				}

			}

			snippet += '\n';

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

				if ( shaderStage === 'fragment' ) {

					snippet += `[[ group( 0 ), binding( ${index ++} ) ]] var ${uniform.name}_sampler : sampler; `;

				}

				snippet += `[[ group( 0 ), binding( ${index ++} ) ]] var ${uniform.name} : texture_2d<f32>; `;

			} else if ( uniform.type === 'buffer' ) {

				const bufferNode = uniform.node;
				const bufferType = this.getType( bufferNode.bufferType );
				const bufferCount = bufferNode.bufferCount;

				const bufferSnippet = `\t${uniform.name} : array< ${bufferType}, ${bufferCount} >;\n`;

				snippet += this._getWGSLUniforms( 'NodeBuffer', bufferSnippet, index ++ ) + '\n\n';

			} else {

				const vectorType = this.getType( this.getVectorType( uniform.type ) );

				if ( Array.isArray( uniform.value ) === true ) {

					const length = uniform.value.length;

					groupSnippet += `uniform ${vectorType}[ ${length} ] ${uniform.name}; `;

				} else {

					groupSnippet += `\t${uniform.name} : ${ vectorType};\n`;

				}

			}

		}

		if ( groupSnippet ) {

			snippet += this._getWGSLUniforms( 'NodeUniforms', groupSnippet, index ++ );

		}

		return snippet;

	}

	buildCode() {

		const shadersData = { fragment: {}, vertex: {} };

		for ( const shaderStage in shadersData ) {

			let flow = '// code\n';
			flow += `\t${ this.flowCode[ shaderStage ] }`;
			flow += '\n';

			const flowNodes = this.flowNodes[ shaderStage ];
			const mainNode = flowNodes[ flowNodes.length - 1 ];

			for ( const node of flowNodes ) {

				const flowSlotData = this.getFlowData( shaderStage, node );
				const slotName = node.name;

				if ( slotName ) {

					if ( flow.length > 0 ) flow += '\n';

					flow += `\t// FLOW -> ${ slotName }\n\t`;

				}

				flow += `${ flowSlotData.code }\n\t`;

				if ( node === mainNode ) {

					flow += '// FLOW RESULT\n\t';

					if ( shaderStage === 'vertex' ) {

						flow += 'NodeVarys.Vertex = ';

					} else if ( shaderStage === 'fragment' ) {

						flow += 'return ';

					}

					flow += `${ flowSlotData.result };`;

				}

			}

			const stageData = shadersData[ shaderStage ];

			stageData.uniforms = this.getUniforms( shaderStage );
			stageData.attributes = this.getAttributes( shaderStage );
			stageData.varys = this.getVarys( shaderStage );
			stageData.vars = this.getVars( shaderStage );
			stageData.codes = this.getCodes( shaderStage );
			stageData.flow = flow;

		}

		this.vertexShader = this._getWGSLVertexCode( shadersData.vertex );
		this.fragmentShader = this._getWGSLFragmentCode( shadersData.fragment );

	}

	getMethod( method ) {

		if ( wgslPolyfill[ method ] !== undefined ) {

			this._include( method );

		}

		return wgslMethods[ method ] || method;

	}

	getType( type ) {

		return wgslTypeLib[ type ] || type;

	}

	_include( name ) {

		wgslPolyfill[ name ].build( this );

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

	_getWGSLVertexCode( shaderData ) {

		return `${ this.getSignature() }

// uniforms
${shaderData.uniforms}

// varys
${shaderData.varys}

// codes
${shaderData.codes}

[[ stage( vertex ) ]]
fn main( ${shaderData.attributes} ) -> NodeVarysStruct {

	// system
	var NodeVarys: NodeVarysStruct;

	// vars
	${shaderData.vars}

	// flow
	${shaderData.flow}

	return NodeVarys;

}
`;

	}

	_getWGSLFragmentCode( shaderData ) {

		return `${ this.getSignature() }

// uniforms
${shaderData.uniforms}

// codes
${shaderData.codes}

[[ stage( fragment ) ]]
fn main( ${shaderData.varys} ) -> [[ location( 0 ) ]] vec4<f32> {

	// vars
	${shaderData.vars}

	// flow
	${shaderData.flow}

}
`;

	}

	_getWGSLStruct( name, vars ) {

		return `
struct ${name} {
\n${vars}
};`;

	}

	_getWGSLUniforms( name, vars, binding = 0, group = 0 ) {

		const structName = name + 'Struct';
		const structSnippet = this._getWGSLStruct( structName, vars );

		return `${structSnippet}
[[ binding( ${binding} ), group( ${group} ) ]]
var<uniform> ${name} : ${structName};`;

	}

}

export default WebGPUNodeBuilder;
