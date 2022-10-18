import WebGPUUniformsGroup from '../WebGPUUniformsGroup.js';
import {
	FloatNodeUniform, Vector2NodeUniform, Vector3NodeUniform, Vector4NodeUniform,
	ColorNodeUniform, Matrix3NodeUniform, Matrix4NodeUniform
} from './WebGPUNodeUniform.js';
import WebGPUNodeSampler from './WebGPUNodeSampler.js';
import { WebGPUNodeSampledTexture, WebGPUNodeSampledCubeTexture } from './WebGPUNodeSampledTexture.js';

import WebGPUUniformBuffer from '../WebGPUUniformBuffer.js';
import WebGPUStorageBuffer from '../WebGPUStorageBuffer.js';
import { getVectorLength, getStrideLength } from '../WebGPUBufferUtils.js';

import { NodeBuilder, WGSLNodeParser, CodeNode, NodeMaterial } from 'three/nodes';

const gpuShaderStageLib = {
	'vertex': GPUShaderStage.VERTEX,
	'fragment': GPUShaderStage.FRAGMENT,
	'compute': GPUShaderStage.COMPUTE
};

const supports = {
	instance: true
};

const wgslTypeLib = {
	float: 'f32',
	int: 'i32',
	uint: 'u32',
	bool: 'bool',

	vec2: 'vec2<f32>',
	ivec2: 'vec2<i32>',
	uvec2: 'vec2<u32>',
	bvec2: 'vec2<bool>',

	vec3: 'vec3<f32>',
	ivec3: 'vec3<i32>',
	uvec3: 'vec3<u32>',
	bvec3: 'vec3<bool>',

	vec4: 'vec4<f32>',
	ivec4: 'vec4<i32>',
	uvec4: 'vec4<u32>',
	bvec4: 'vec4<bool>',

	mat3: 'mat3x3<f32>',
	imat3: 'mat3x3<i32>',
	umat3: 'mat3x3<u32>',
	bmat3: 'mat3x3<bool>',

	mat4: 'mat4x4<f32>',
	imat4: 'mat4x4<i32>',
	umat4: 'mat4x4<u32>',
	bmat4: 'mat4x4<bool>'
};

const wgslMethods = {
	dFdx: 'dpdx',
	dFdy: 'dpdy',
	mod: 'threejs_mod',
	lessThanEqual: 'threejs_lessThanEqual',
	inversesqrt: 'inverseSqrt'
};

const wgslPolyfill = {
	lessThanEqual: new CodeNode( `
fn threejs_lessThanEqual( a : vec3<f32>, b : vec3<f32> ) -> vec3<bool> {

	return vec3<bool>( a.x <= b.x, a.y <= b.y, a.z <= b.z );

}
` ),
	mod: new CodeNode( `
fn threejs_mod( x : f32, y : f32 ) -> f32 {

	return x - y * floor( x / y );

}
` ),
	repeatWrapping: new CodeNode( `
fn threejs_repeatWrapping( uv : vec2<f32>, dimension : vec2<i32> ) -> vec2<i32> {

	let uvScaled = vec2<i32>( uv * vec2<f32>( dimension ) );

	return ( ( uvScaled % dimension ) + dimension ) % dimension;

}
` )
};

class WebGPUNodeBuilder extends NodeBuilder {

	constructor( object, renderer ) {

		super( object, renderer, new WGSLNodeParser() );

		this.bindings = { vertex: [], fragment: [], compute: [] };
		this.bindingsOffset = { vertex: 0, fragment: 0, compute: 0 };

		this.uniformsGroup = {};

		this.builtins = {
			vertex: new Map(),
			fragment: new Map(),
			compute: new Map(),
			attribute: new Map()
		};

	}

	build() {

		const { object, material } = this;

		if ( material !== null ) {

			NodeMaterial.fromMaterial( material ).build( this );

		} else {

			this.addFlow( 'compute', object );

		}

		return super.build();

	}

	addFlowCode( code ) {

		if ( ! /;\s*$/.test( code ) ) {

			code += ';';

		}

		super.addFlowCode( code + '\n\t' );

	}

	getSampler( textureProperty, uvSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSample( ${textureProperty}, ${textureProperty}_sampler, ${uvSnippet} )`;

		} else {

			this._include( 'repeatWrapping' );

			const dimension = `textureDimensions( ${textureProperty}, 0 )`;

			return `textureLoad( ${textureProperty}, threejs_repeatWrapping( ${uvSnippet}, ${dimension} ), 0 )`;

		}

	}

	getSamplerLevel( textureProperty, uvSnippet, biasSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSampleLevel( ${textureProperty}, ${textureProperty}_sampler, ${uvSnippet}, ${biasSnippet} )`;

		} else {

			this._include( 'repeatWrapping' );

			const dimension = `textureDimensions( ${textureProperty}, 0 )`;

			return `textureLoad( ${textureProperty}, threejs_repeatWrapping( ${uvSnippet}, ${dimension} ), i32( ${biasSnippet} ) )`;

		}

	}

	getTexture( textureProperty, uvSnippet, shaderStage = this.shaderStage ) {

		return this.getSampler( textureProperty, uvSnippet, shaderStage );

	}

	getTextureLevel( textureProperty, uvSnippet, biasSnippet, shaderStage = this.shaderStage ) {

		return this.getSamplerLevel( textureProperty, uvSnippet, biasSnippet, shaderStage );

	}

	getCubeTexture( textureProperty, uvSnippet, shaderStage = this.shaderStage ) {

		return this.getSampler( textureProperty, uvSnippet, shaderStage );

	}

	getCubeTextureLevel( textureProperty, uvSnippet, biasSnippet, shaderStage = this.shaderStage ) {

		return this.getSamplerLevel( textureProperty, uvSnippet, biasSnippet, shaderStage );

	}

	getPropertyName( node, shaderStage = this.shaderStage ) {

		if ( node.isNodeVarying === true ) {

			if ( shaderStage === 'vertex' ) {

				return `NodeVaryings.${ node.name }`;

			}

		} else if ( node.isNodeUniform === true ) {

			const name = node.name;
			const type = node.type;

			if ( type === 'texture' || type === 'cubeTexture' ) {

				return name;

			} else if ( type === 'buffer' || type === 'storageBuffer' ) {

				return `NodeBuffer_${node.node.id}.${name}`;

			} else {

				return `NodeUniforms.${name}`;

			}

		}

		return super.getPropertyName( node );

	}

	getBindings() {

		const bindings = this.bindings;

		return this.material !== null ? [ ...bindings.vertex, ...bindings.fragment ] : bindings.compute;

	}

	getUniformFromNode( node, shaderStage, type ) {

		const uniformNode = super.getUniformFromNode( node, shaderStage, type );
		const nodeData = this.getDataFromNode( node, shaderStage );

		if ( nodeData.uniformGPU === undefined ) {

			let uniformGPU;

			const bindings = this.bindings[ shaderStage ];

			if ( type === 'texture' || type === 'cubeTexture' ) {

				const sampler = new WebGPUNodeSampler( `${uniformNode.name}_sampler`, uniformNode.node );

				let texture = null;

				if ( type === 'texture' ) {

					texture = new WebGPUNodeSampledTexture( uniformNode.name, uniformNode.node );

				} else if ( type === 'cubeTexture' ) {

					texture = new WebGPUNodeSampledCubeTexture( uniformNode.name, uniformNode.node );

				}

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

			} else if ( type === 'buffer' || type === 'storageBuffer' ) {

				const bufferClass = type === 'storageBuffer' ? WebGPUStorageBuffer : WebGPUUniformBuffer;
				const buffer = new bufferClass( 'NodeBuffer_' + node.id, node.value );
				buffer.setVisibility( gpuShaderStageLib[ shaderStage ] );

				// add first textures in sequence and group for last
				const lastBinding = bindings[ bindings.length - 1 ];
				const index = lastBinding && lastBinding.isUniformsGroup ? bindings.length - 1 : bindings.length;

				bindings.splice( index, 0, buffer );

				uniformGPU = buffer;

			} else {

				let uniformsGroup = this.uniformsGroup[ shaderStage ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new WebGPUUniformsGroup( 'nodeUniforms' );
					uniformsGroup.setVisibility( gpuShaderStageLib[ shaderStage ] );

					this.uniformsGroup[ shaderStage ] = uniformsGroup;

					bindings.push( uniformsGroup );

				}

				if ( node.isArrayUniformNode === true ) {

					uniformGPU = [];

					for ( const uniformNode of node.nodes ) {

						const uniformNodeGPU = this._getNodeUniform( uniformNode, type );

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

	isReference( type ) {

		return super.isReference( type ) || type === 'texture_2d' || type === 'texture_cube';

	}

	getBuiltin( name, property, type, shaderStage = this.shaderStage ) {

		const map = this.builtins[ shaderStage ];

		if ( map.has( name ) === false ) {

			map.set( name, {
				name,
				property,
				type
			} );

		}

		return property;

	}

	getInstanceIndex() {

		if ( this.shaderStage === 'vertex' ) {

			return this.getBuiltin( 'instance_index', 'instanceIndex', 'u32', 'attribute' );

		}

		return 'instanceIndex';

	}

	getFrontFacing() {

		return this.getBuiltin( 'front_facing', 'isFront', 'bool' );

	}

	getAttributes( shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'vertex' || shaderStage === 'compute' ) {

			if ( shaderStage === 'compute' ) {

				this.getBuiltin( 'global_invocation_id', 'id', 'vec3<u32>', 'attribute' );

			}

			for ( const { name, property, type } of this.builtins.attribute.values() ) {

				snippets.push( `@builtin( ${name} ) ${property} : ${type}` );

			}

			const attributes = this.attributes;
			const length = attributes.length;

			for ( let index = 0; index < length; index ++ ) {

				const attribute = attributes[ index ];
				const name = attribute.name;
				const type = this.getType( attribute.type );

				snippets.push( `@location( ${index} ) ${ name } : ${ type }` );

			}

		}

		return snippets.join( ',\n\t' );

	}

	getVars( shaderStage ) {

		const snippets = [];
		const vars = this.vars[ shaderStage ];

		for ( const variable of vars ) {

			const name = variable.name;
			const type = this.getType( variable.type );

			snippets.push( `\tvar ${name} : ${type};` );

		}

		return `\n${ snippets.join( '\n' ) }\n`;

	}

	getVaryings( shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'vertex' ) {

			this.getBuiltin( 'position', 'Vertex', 'vec4<f32>', 'vertex' );

			const varyings = this.varyings;

			for ( let index = 0; index < varyings.length; index ++ ) {

				const varying = varyings[ index ];

				snippets.push( `@location( ${index} ) ${ varying.name } : ${ this.getType( varying.type ) }` );

			}

		} else if ( shaderStage === 'fragment' ) {

			const varyings = this.varyings;

			for ( let index = 0; index < varyings.length; index ++ ) {

				const varying = varyings[ index ];

				snippets.push( `@location( ${index} ) ${ varying.name } : ${ this.getType( varying.type ) }` );

			}

		}

		for ( const { name, property, type } of this.builtins[ shaderStage ].values() ) {

			snippets.push( `@builtin( ${name} ) ${property} : ${type}` );

		}

		const code = snippets.join( ',\n\t' );

		return shaderStage === 'vertex' ? this._getWGSLStruct( 'NodeVaryingsStruct', '\t' + code ) : code;

	}

	getUniforms( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		const bindingSnippets = [];
		const bufferSnippets = [];
		const groupSnippets = [];

		let index = this.bindingsOffset[ shaderStage ];

		for ( const uniform of uniforms ) {

			if ( uniform.type === 'texture' ) {

				if ( shaderStage === 'fragment' ) {

					bindingSnippets.push( `@group( 0 ) @binding( ${index ++} ) var ${uniform.name}_sampler : sampler;` );

				}

				bindingSnippets.push( `@group( 0 ) @binding( ${index ++} ) var ${uniform.name} : texture_2d<f32>;` );

			} else if ( uniform.type === 'cubeTexture' ) {

				if ( shaderStage === 'fragment' ) {

					bindingSnippets.push( `@group( 0 ) @binding( ${index ++} ) var ${uniform.name}_sampler : sampler;` );

				}

				bindingSnippets.push( `@group( 0 ) @binding( ${index ++} ) var ${uniform.name} : texture_cube<f32>;` );

			} else if ( uniform.type === 'buffer' || uniform.type === 'storageBuffer' ) {

				const bufferNode = uniform.node;
				const bufferType = this.getType( bufferNode.bufferType );
				const bufferCount = bufferNode.bufferCount;

				const bufferCountSnippet = bufferCount > 0 ? ', ' + bufferCount : '';
				const bufferSnippet = `\t${uniform.name} : array< ${bufferType}${bufferCountSnippet} >\n`;
				const bufferAccessMode = bufferNode.isStorageBufferNode ? 'storage,read_write' : 'uniform';

				bufferSnippets.push( this._getWGSLStructBinding( 'NodeBuffer_' + bufferNode.id, bufferSnippet, bufferAccessMode, index ++ ) );

			} else {

				const vectorType = this.getType( this.getVectorType( uniform.type ) );

				if ( Array.isArray( uniform.value ) === true ) {

					const length = uniform.value.length;

					groupSnippets.push( `uniform ${vectorType}[ ${length} ] ${uniform.name}` );

				} else {

					groupSnippets.push( `\t${uniform.name} : ${ vectorType}` );

				}

			}

		}

		let code = bindingSnippets.join( '\n' );
		code += bufferSnippets.join( '\n' );

		if ( groupSnippets.length > 0 ) {

			code += this._getWGSLStructBinding( 'NodeUniforms', groupSnippets.join( ',\n' ), 'uniform', index ++ );

		}

		return code;

	}

	buildCode() {

		const shadersData = this.material !== null ? { fragment: {}, vertex: {} } : { compute: {} };

		for ( const shaderStage in shadersData ) {

			let flow = '// code\n';
			flow += `\t${ this.flowCode[ shaderStage ] }`;
			flow += '\n\t';

			const flowNodes = this.flowNodes[ shaderStage ];
			const mainNode = flowNodes[ flowNodes.length - 1 ];

			for ( const node of flowNodes ) {

				const flowSlotData = this.getFlowData( node/*, shaderStage*/ );
				const slotName = node.name;

				if ( slotName ) {

					if ( flow.length > 0 ) flow += '\n';

					flow += `\t// FLOW -> ${ slotName }\n\t`;

				}

				flow += `${ flowSlotData.code }\n\t`;

				if ( node === mainNode && shaderStage !== 'compute' ) {

					flow += '// FLOW RESULT\n\t';

					if ( shaderStage === 'vertex' ) {

						flow += 'NodeVaryings.Vertex = ';

					} else if ( shaderStage === 'fragment' ) {

						flow += 'return ';

					}

					flow += `${ flowSlotData.result };`;

				}

			}

			const stageData = shadersData[ shaderStage ];

			stageData.uniforms = this.getUniforms( shaderStage );
			stageData.attributes = this.getAttributes( shaderStage );
			stageData.varyings = this.getVaryings( shaderStage );
			stageData.vars = this.getVars( shaderStage );
			stageData.codes = this.getCodes( shaderStage );
			stageData.flow = flow;

		}

		if ( this.material !== null ) {

			this.vertexShader = this._getWGSLVertexCode( shadersData.vertex );
			this.fragmentShader = this._getWGSLFragmentCode( shadersData.fragment );

		} else {

			this.computeShader = this._getWGSLComputeCode( shadersData.compute, ( this.object.workgroupSize || [ 64 ] ).join( ', ' ) );

		}

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

	isAvailable( name ) {

		return supports[ name ] === true;

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

// varyings
${shaderData.varyings}

// codes
${shaderData.codes}

@vertex
fn main( ${shaderData.attributes} ) -> NodeVaryingsStruct {

	// system
	var NodeVaryings: NodeVaryingsStruct;

	// vars
	${shaderData.vars}

	// flow
	${shaderData.flow}

	return NodeVaryings;

}
`;

	}

	_getWGSLFragmentCode( shaderData ) {

		return `${ this.getSignature() }

// uniforms
${shaderData.uniforms}

// codes
${shaderData.codes}

@fragment
fn main( ${shaderData.varyings} ) -> @location( 0 ) vec4<f32> {

	// vars
	${shaderData.vars}

	// flow
	${shaderData.flow}

}
`;

	}

	_getWGSLComputeCode( shaderData, workgroupSize ) {

		return `${ this.getSignature() }
// system
var<private> instanceIndex : u32;

// uniforms
${shaderData.uniforms}

// codes
${shaderData.codes}

@compute @workgroup_size( ${workgroupSize} )
fn main( ${shaderData.attributes} ) {

	// system
	instanceIndex = id.x;

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
${vars}
};`;

	}

	_getWGSLStructBinding( name, vars, access, binding = 0, group = 0 ) {

		const structName = name + 'Struct';
		const structSnippet = this._getWGSLStruct( structName, vars );

		return `${structSnippet}
@binding( ${binding} ) @group( ${group} )
var<${access}> ${name} : ${structName};`;

	}

}

export default WebGPUNodeBuilder;
