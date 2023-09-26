import { NoColorSpace, FloatType } from 'three';

import UniformsGroup from '../../common/UniformsGroup.js';

import NodeSampler from '../../common/nodes/NodeSampler.js';
import { NodeSampledTexture, NodeSampledCubeTexture } from '../../common/nodes/NodeSampledTexture.js';

import UniformBuffer from '../../common/UniformBuffer.js';
import StorageBuffer from '../../common/StorageBuffer.js';
import { getVectorLength, getStrideLength } from '../../common/BufferUtils.js';

import { NodeBuilder, CodeNode, NodeMaterial } from '../../../nodes/Nodes.js';

import { getFormat } from '../utils/WebGPUTextureUtils.js';

import WGSLNodeParser from './WGSLNodeParser.js';

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
	color: 'vec3<f32>',

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
	dFdy: '- dpdy',
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
fn threejs_repeatWrapping( uv : vec2<f32>, dimension : vec2<u32> ) -> vec2<u32> {

	let uvScaled = vec2<u32>( uv * vec2<f32>( dimension ) );

	return ( ( uvScaled % dimension ) + dimension ) % dimension;

}
` )
};

class WGSLNodeBuilder extends NodeBuilder {

	constructor( object, renderer, scene = null ) {

		super( object, renderer, new WGSLNodeParser(), scene );

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

	needsColorSpaceToLinear( texture ) {

		return texture.isVideoTexture === true && texture.colorSpace !== NoColorSpace;

	}

	_getSampler( texture, textureProperty, uvSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSample( ${textureProperty}, ${textureProperty}_sampler, ${uvSnippet} )`;

		} else {

			return this.getTextureLoad( texture, textureProperty, uvSnippet );

		}

	}

	_getVideoSampler( textureProperty, uvSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSampleBaseClampToEdge( ${textureProperty}, ${textureProperty}_sampler, vec2<f32>( ${uvSnippet}.x, 1.0 - ${uvSnippet}.y ) )`;

		} else {

			console.error( `WebGPURenderer: THREE.VideoTexture does not support ${ shaderStage } shader.` );

		}

	}

	_getSamplerLevel( texture, textureProperty, uvSnippet, biasSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' && this.isUnfilterable( texture ) === false ) {

			return `textureSampleLevel( ${textureProperty}, ${textureProperty}_sampler, ${uvSnippet}, ${biasSnippet} )`;

		} else {

			return this.getTextureLoad( texture, textureProperty, uvSnippet, biasSnippet );

		}

	}

	getTextureLoad( texture, textureProperty, uvSnippet, biasSnippet = '0' ) {

		this._include( 'repeatWrapping' );

		const dimension = `textureDimensions( ${textureProperty}, 0 )`;

		return `textureLoad( ${textureProperty}, threejs_repeatWrapping( ${uvSnippet}, ${dimension} ), i32( ${biasSnippet} ) )`;

	}

	isUnfilterable( texture ) {

		return texture.isDataTexture === true && texture.type === FloatType;

	}

	getTexture( texture, textureProperty, uvSnippet, shaderStage = this.shaderStage ) {

		let snippet = null;

		if ( texture.isVideoTexture === true ) {

			snippet = this._getVideoSampler( textureProperty, uvSnippet, shaderStage );

		} else if ( this.isUnfilterable( texture ) ) {

			snippet = this.getTextureLoad( texture, textureProperty, uvSnippet );

		} else {

			snippet = this._getSampler( texture, textureProperty, uvSnippet, shaderStage );

		}

		return snippet;

	}

	getTextureCompare( texture, textureProperty, uvSnippet, compareSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSampleCompare( ${textureProperty}, ${textureProperty}_sampler, ${uvSnippet}, ${compareSnippet} )`;

		} else {

			console.error( `WebGPURenderer: THREE.DepthTexture.compareFunction() does not support ${ shaderStage } shader.` );

		}

	}

	getTextureLevel( texture, textureProperty, uvSnippet, biasSnippet, shaderStage = this.shaderStage ) {

		let snippet = null;

		if ( texture.isVideoTexture === true ) {

			snippet = this._getVideoSampler( textureProperty, uvSnippet, shaderStage );

		} else {

			snippet = this._getSamplerLevel( texture, textureProperty, uvSnippet, biasSnippet, shaderStage );

		}

		return snippet;

	}

	getPropertyName( node, shaderStage = this.shaderStage ) {

		if ( node.isNodeVarying === true && node.needsInterpolation === true ) {

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

	getUniformFromNode( node, type, shaderStage, name = null ) {

		const uniformNode = super.getUniformFromNode( node, type, shaderStage, name );
		const nodeData = this.getDataFromNode( node, shaderStage );

		if ( nodeData.uniformGPU === undefined ) {

			let uniformGPU;

			const bindings = this.bindings[ shaderStage ];

			if ( type === 'texture' || type === 'cubeTexture' ) {

				let texture = null;

				if ( type === 'texture' ) {

					texture = new NodeSampledTexture( uniformNode.name, uniformNode.node );

				} else if ( type === 'cubeTexture' ) {

					texture = new NodeSampledCubeTexture( uniformNode.name, uniformNode.node );

				}

				texture.store = node.isStoreTextureNode === true;
				texture.setVisibility( gpuShaderStageLib[ shaderStage ] );

				// add first textures in sequence and group for last
				const lastBinding = bindings[ bindings.length - 1 ];
				const index = lastBinding && lastBinding.isUniformsGroup ? bindings.length - 1 : bindings.length;

				if ( shaderStage === 'fragment' && this.isUnfilterable( node.value ) === false && texture.store === false ) {

					const sampler = new NodeSampler( `${uniformNode.name}_sampler`, uniformNode.node );
					sampler.setVisibility( gpuShaderStageLib[ shaderStage ] );

					bindings.splice( index, 0, sampler, texture );

					uniformGPU = [ sampler, texture ];

				} else {

					bindings.splice( index, 0, texture );

					uniformGPU = [ texture ];

				}

			} else if ( type === 'buffer' || type === 'storageBuffer' ) {

				const bufferClass = type === 'storageBuffer' ? StorageBuffer : UniformBuffer;
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

					uniformsGroup = new UniformsGroup( 'nodeUniforms' );
					uniformsGroup.setVisibility( gpuShaderStageLib[ shaderStage ] );

					this.uniformsGroup[ shaderStage ] = uniformsGroup;

					bindings.push( uniformsGroup );

				}

				if ( node.isArrayUniformNode === true ) {

					uniformGPU = [];

					for ( const uniformNode of node.nodes ) {

						const uniformNodeGPU = this.getNodeUniform( uniformNode, type );

						// fit bounds to buffer
						uniformNodeGPU.boundary = getVectorLength( uniformNodeGPU.itemSize );
						uniformNodeGPU.itemSize = getStrideLength( uniformNodeGPU.itemSize );

						uniformsGroup.addUniform( uniformNodeGPU );

						uniformGPU.push( uniformNodeGPU );

					}

				} else {

					uniformGPU = this.getNodeUniform( uniformNode, type );

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

		return super.isReference( type ) || type === 'texture_2d' || type === 'texture_cube' || type === 'texture_storage_2d';

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

	getVertexIndex() {

		if ( this.shaderStage === 'vertex' ) {

			return this.getBuiltin( 'vertex_index', 'vertexIndex', 'u32', 'attribute' );

		}

		return 'vertexIndex';

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

	getFragCoord() {

		return this.getBuiltin( 'position', 'fragCoord', 'vec4<f32>', 'fragment' );

	}

	isFlipY() {

		return false;

	}

	getAttributes( shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'compute' ) {

			this.getBuiltin( 'global_invocation_id', 'id', 'vec3<u32>', 'attribute' );

		}

		if ( shaderStage === 'vertex' || shaderStage === 'compute' ) {

			for ( const { name, property, type } of this.builtins.attribute.values() ) {

				snippets.push( `@builtin( ${name} ) ${property} : ${type}` );

			}

			const attributes = this.getAttributesArray();

			for ( let index = 0, length = attributes.length; index < length; index ++ ) {

				const attribute = attributes[ index ];
				const name = attribute.name;
				const type = this.getType( attribute.type );

				snippets.push( `@location( ${index} ) ${ name } : ${ type }` );

			}

		}

		return snippets.join( ',\n\t' );

	}

	getStructMembers( struct ) {

		const snippets = [];
		const members = struct.getMemberTypes();

		for ( let i = 0; i < members.length; i ++ ) {

			const member = members[ i ];
			snippets.push( `\t@location( ${i} ) m${i} : ${ member }<f32>` );

		}

		return snippets.join( ',\n' );

	}

	getStructs( shaderStage ) {

		const snippets = [];
		const structs = this.structs[ shaderStage ];

		for ( let index = 0, length = structs.length; index < length; index ++ ) {

			const struct = structs[ index ];
			const name = struct.name;

			let snippet = `\struct ${ name } {\n`;
			snippet += this.getStructMembers( struct );
			snippet += '\n}';

			snippets.push( snippet );

		}

		return snippets.join( '\n\n' );

	}

	getVar( type, name ) {

		return `var ${ name } : ${ this.getType( type ) }`;

	}

	getVars( shaderStage ) {

		const snippets = [];
		const vars = this.vars[ shaderStage ];

		for ( const variable of vars ) {

			snippets.push( `\t${ this.getVar( variable.type, variable.name ) };` );

		}

		return `\n${ snippets.join( '\n' ) }\n`;

	}

	getVaryings( shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'vertex' ) {

			this.getBuiltin( 'position', 'Vertex', 'vec4<f32>', 'vertex' );

		}

		if ( shaderStage === 'vertex' || shaderStage === 'fragment' ) {

			const varyings = this.varyings;
			const vars = this.vars[ shaderStage ];

			for ( let index = 0; index < varyings.length; index ++ ) {

				const varying = varyings[ index ];

				if ( varying.needsInterpolation ) {

					let attributesSnippet = `@location( ${index} )`;

					if ( varying.type === 'int' || varying.type === 'uint' ) {

						attributesSnippet += ' @interpolate( flat )';


					}

					snippets.push( `${ attributesSnippet } ${ varying.name } : ${ this.getType( varying.type ) }` );

				} else if ( shaderStage === 'vertex' && vars.includes( varying ) === false ) {

					vars.push( varying );

				}

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

			if ( uniform.type === 'texture' || uniform.type === 'cubeTexture' ) {

				const texture = uniform.node.value;

				if ( shaderStage === 'fragment' && this.isUnfilterable( texture ) === false && uniform.node.isStoreTextureNode !== true ) {

					if ( texture.isDepthTexture === true && texture.compareFunction !== null ) {

						bindingSnippets.push( `@binding( ${index ++} ) @group( 0 ) var ${uniform.name}_sampler : sampler_comparison;` );

					} else {

						bindingSnippets.push( `@binding( ${index ++} ) @group( 0 ) var ${uniform.name}_sampler : sampler;` );

					}

				}

				let textureType;

				if ( texture.isCubeTexture === true ) {

					textureType = 'texture_cube<f32>';

				} else if ( texture.isDepthTexture === true ) {

					textureType = 'texture_depth_2d';

				} else if ( texture.isVideoTexture === true ) {

					textureType = 'texture_external';

				} else if ( uniform.node.isStoreTextureNode === true ) {

					const format = getFormat( texture );

					textureType = 'texture_storage_2d<' + format + ', write>';

				} else {

					textureType = 'texture_2d<f32>';

				}

				bindingSnippets.push( `@binding( ${index ++} ) @group( 0 ) var ${uniform.name} : ${textureType};` );

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

			let flow = '// code\n\n';
			flow += this.flowCode[ shaderStage ];

			const flowNodes = this.flowNodes[ shaderStage ];
			const mainNode = flowNodes[ flowNodes.length - 1 ];

			for ( const node of flowNodes ) {

				const flowSlotData = this.getFlowData( node/*, shaderStage*/ );
				const slotName = node.name;

				if ( slotName ) {

					if ( flow.length > 0 ) flow += '\n';

					flow += `\t// flow -> ${ slotName }\n\t`;

				}

				flow += `${ flowSlotData.code }\n\t`;

				if ( node === mainNode && shaderStage !== 'compute' ) {

					flow += '// result\n\t';

					if ( shaderStage === 'vertex' ) {

						flow += 'NodeVaryings.Vertex = ';

					} else if ( shaderStage === 'fragment' ) {

						flow += 'return ';

					}

					flow += `${ flowSlotData.result };`;

				}

			}

			const outputNode = mainNode.outputNode;
			const stageData = shadersData[ shaderStage ];

			stageData.uniforms = this.getUniforms( shaderStage );
			stageData.attributes = this.getAttributes( shaderStage );
			stageData.varyings = this.getVaryings( shaderStage );
			stageData.structs = this.getStructs( shaderStage );
			stageData.vars = this.getVars( shaderStage );
			stageData.codes = this.getCodes( shaderStage );
			stageData.returnType = ( outputNode !== undefined && outputNode.isOutputStructNode === true ) ? outputNode.nodeType : '@location( 0 ) vec4<f32>';
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

// structs
${shaderData.structs}

// codes
${shaderData.codes}

@fragment
fn main( ${shaderData.varyings} ) -> ${shaderData.returnType} {

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

export default WGSLNodeBuilder;
