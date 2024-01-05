import { NoColorSpace, FloatType } from 'three';

import { NodeBuilder, wgslFn } from 'three/nodes';

import UniformsGroup from '../../common/UniformsGroup.js';

import NodeSampler from '../../common/nodes/NodeSampler.js';
import { NodeSampledTexture, NodeSampledCubeTexture } from '../../common/nodes/NodeSampledTexture.js';

import UniformBuffer from '../../common/UniformBuffer.js';
import StorageBuffer from '../../common/StorageBuffer.js';
import { getVectorLength, getStrideLength } from '../../common/BufferUtils.js';

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

const wgslMethods = {
	dFdx: 'dpdx',
	dFdy: '- dpdy',
	mod: 'threejs_mod',
	inversesqrt: 'inverseSqrt'
};

const wgslPolyfill = {
	mod: wgslFn( `
fn threejs_mod( x : f32, y : f32 ) -> f32 {

	return x - y * floor( x / y );

}
` ).functionNode,
	repeatWrapping: wgslFn( `
fn threejs_repeatWrapping( uv : vec2<f32>, dimension : vec2<u32> ) -> vec2<u32> {

	return vec2<u32>( uv * vec2<f32>( dimension ) ) % dimension;

}
` ).functionNode
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

		this.isWGSLNodeBuilder = true;

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

			return `textureSampleBaseClampToEdge( ${textureProperty}, ${textureProperty}_sampler, vec2<f32>( ${uvSnippet}.x, 1.0 - ${uvSnippet}.y ) )`; // @TODO: is there a way that we can make this and similar snippets nodes (to get all of their benefits, including caching and auto-temping with TempNode)?

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

	getUniformFromNode( node, name = null, type = node.getNodeType( this ), shaderStage = this.shaderStage ) {

		const nodeUniform = super.getUniformFromNode( node, name, type, shaderStage );
		const nodeData = this.getNodeData( node, shaderStage );

		if ( nodeData.uniformGPU === undefined ) {

			let uniformGPU;

			const bindings = this.bindings[ shaderStage ];

			if ( type === 'texture' || type === 'cubeTexture' ) {

				let texture = null;

				if ( type === 'texture' ) {

					texture = new NodeSampledTexture( nodeUniform.name, nodeUniform.node );

				} else if ( type === 'cubeTexture' ) {

					texture = new NodeSampledCubeTexture( nodeUniform.name, nodeUniform.node );

				}

				texture.store = node.isStoreTextureNode === true;
				texture.setVisibility( gpuShaderStageLib[ shaderStage ] );

				// add first textures in sequence and group for last
				const lastBinding = bindings[ bindings.length - 1 ];
				const index = lastBinding && lastBinding.isUniformsGroup ? bindings.length - 1 : bindings.length;

				if ( shaderStage === 'fragment' && this.isUnfilterable( node.value ) === false && texture.store === false ) {

					const sampler = new NodeSampler( `${nodeUniform.name}_sampler`, nodeUniform.node );
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

					for ( const nodeUniform of node.nodes ) {

						const nodeUniformGPU = this.getUniformGPU( nodeUniform, type );

						// fit bounds to buffer
						nodeUniformGPU.boundary = getVectorLength( nodeUniformGPU.itemSize );
						nodeUniformGPU.itemSize = getStrideLength( nodeUniformGPU.itemSize );

						uniformsGroup.addUniform( nodeUniformGPU );

						uniformGPU.push( nodeUniformGPU );

					}

				} else {

					uniformGPU = this.getUniformGPU( nodeUniform );

					uniformsGroup.addUniform( uniformGPU );

				}

			}

			nodeData.uniformGPU = uniformGPU;

			if ( shaderStage === 'vertex' ) {

				this.bindingsOffset[ 'fragment' ] = bindings.length;

			}

		}

		return nodeUniform;

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
				type: this.getType( type )
			} );

		}

		return property;

	}

	getVertexIndex() {

		if ( this.shaderStage === 'vertex' ) {

			return this.getBuiltin( 'vertex_index', 'vertexIndex', 'uint', 'attribute' );

		}

		return 'vertexIndex';

	}

	formatFunction( name, inputs, type, code ) {

		const parameters = inputs.map( input => input.name + ' : ' + input.type ).join( ', ' );
		return `fn ${ name }( ${ parameters } ) -> ${ type } {\n\n${ code }\n\n}`;

	}

	getInstanceIndex() {

		if ( this.shaderStage === 'vertex' ) {

			return this.getBuiltin( 'instance_index', 'instanceIndex', 'uint', 'attribute' );

		}

		return 'instanceIndex';

	}

	getFrontFacing() {

		return this.getBuiltin( 'front_facing', 'isFront', 'bool' );

	}

	getFragCoord() {

		return this.getBuiltin( 'position', 'fragCoord', 'vec4', 'fragment' );

	}

	isFlipY() {

		return false;

	}

	getAttributes( shaderStage = this.shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'compute' ) {

			this.getBuiltin( 'global_invocation_id', 'id', 'uvec3', 'attribute' );

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

			snippets.push( `@location( ${i} ) m${i} : ${ members[ i ] }<f32>` );

		}

		return snippets.join( ',\n\t' );

	}

	getStructs( shaderStage = this.shaderStage ) {

		const snippets = [];
		const structs = this.structs[ shaderStage ];

		for ( let index = 0, length = structs.length; index < length; index ++ ) {

			const struct = structs[ index ];
			const name = struct.name;

			snippets.push( `struct ${ name } {\n\t${ this.getStructMembers( struct ) }\n}` );

		}

		return snippets.join( '\n\n' );

	}

	getVar( type, name ) {

		return `var ${ name } : ${ this.getType( type ) }`;

	}

	getVars( shaderStage = this.shaderStage ) {

		const snippets = [];
		const vars = this.vars[ shaderStage ];

		for ( const variable of vars ) {

			snippets.push( `${ this.getVar( variable.type, variable.name ) };` );

		}

		return snippets.join( '\n\t' );

	}

	getVaryings( shaderStage = this.shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'vertex' ) {

			this.getBuiltin( 'position', 'Vertex', 'vec4', 'vertex' );

		}

		if ( shaderStage === 'vertex' || shaderStage === 'fragment' ) {

			const varyings = this.varyings;
			const vars = this.vars[ shaderStage ];

			for ( let index = 0; index < varyings.length; index ++ ) {

				const varying = varyings[ index ];

				if ( varying.needsInterpolation ) {

					let attributesSnippet = `@location( ${index} )`;

					if ( /^(int|uint|ivec|uvec)/.test( varying.type ) ) {

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

	getUniforms( shaderStage = this.shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		const bindingSnippets = [];
		const bufferSnippets = [];
		const groupSnippets = [];

		let index = this.bindingsOffset[ shaderStage ];

		for ( const uniform of uniforms ) {

			if ( uniform.type === 'texture' || uniform.type === 'cubeTexture' ) {

				const texture = uniform.node.value;

				if ( shaderStage === 'fragment' && this.isUnfilterable( texture ) === false && uniform.node.isStoreTextureNode !== true ) {

					const samplerType = texture.isDepthTexture === true && texture.compareFunction !== null ? 'sampler_comparison' : 'sampler';

					bindingSnippets.push( `@binding( ${index ++} ) @group( 0 ) var ${uniform.name}_sampler : ${samplerType};` );

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
				const bufferSnippet = `\t${uniform.name} : ${ this.getType( bufferNode.getNodeType( this ) ) }`;
				const bufferAccessMode = bufferNode.isStorageBufferNode ? 'storage,read_write' : 'uniform';

				bufferSnippets.push( this._getWGSLStructBinding( 'NodeBuffer_' + bufferNode.id, bufferSnippet, bufferAccessMode, index ++ ) );

			} else {

				const vectorType = this.getType( this.getVectorType( uniform.type ) );

				groupSnippets.push( `\t${uniform.name} : ${ vectorType }` );

			}

		}

		let code = bindingSnippets.concat( bufferSnippets ).join( '\n' );

		if ( groupSnippets.length > 0 ) {

			if ( code !== '' ) code += '\n';
			code += this._getWGSLStructBinding( 'NodeUniforms', groupSnippets.join( ',\n' ), 'uniform', index ++ );

		}

		return code;

	}

	buildCode() {

		for ( const shaderStage of this.getShaderStages() ) {

			this.setShaderStage( shaderStage );

			const flowNodes = this.flowNodes[ shaderStage ];
			const outputNodeType = flowNodes[ flowNodes.length - 1 ].getNodeType( this );

			this[ shaderStage + 'Shader' ] = this[ `_getWGSL${ shaderStage[ 0 ].toUpperCase() + shaderStage.slice( 1 )}Code` ]( {
				uniforms: this.getUniforms(),
				attributes: this.getAttributes(),
				varyings: this.getVaryings(),
				vars: this.getVars(),
				structs: this.getStructs(),
				codes: this.getCodes(),
				returnType: this.getTypeLength( outputNodeType ) === 0 ? outputNodeType : '@location( 0 ) vec4<f32>',
				flow: this.prepareShaderFlow( 'NodeVaryings.Vertex = ', 'return ' ),
				workgroupSize: this.object.workgroupSize || [ 64 ]
			} );

		}

		this.setShaderStage( null );

	}

	getMethod( method ) {

		if ( wgslPolyfill[ method ] !== undefined ) {

			this._include( method );

		}

		return wgslMethods[ method ] || method;

	}

	getType( type ) {

		type = super.getType( type );

		const arrayType = /(.+)\[\s*(\d+?)\s*\]/.exec( type );

		if ( arrayType !== null ) {

			const elementType = this.getType( arrayType[ 1 ] );
			return arrayType[ 2 ] !== '' && arrayType[ 2 ] !== 0 ? `array<${ elementType }, ${ arrayType[ 2 ] }>` : `array<${ elementType }>`;

		}

		const componentType = this.getComponentType( type );
		const typeLength = this.getTypeLength( type );

		if ( typeLength > 1 ) {

			const groupType = typeLength <= 4 ? `vec${ typeLength }` : `mat${ Math.sqrt( typeLength ) }x${ Math.sqrt( typeLength ) }`;
			return `${ groupType }<${ this.getType( componentType ) }>`;

		}

		if ( componentType === 'float' || componentType === 'int' || componentType === 'uint' ) return componentType[ 0 ] + '32';
		if ( componentType === 'bool' ) return componentType;

		return type;

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

	_getWGSLComputeCode( shaderData ) {

		return `${ this.getSignature() }

// system
var<private> instanceIndex : u32;

// uniforms
${shaderData.uniforms}

// codes
${shaderData.codes}

@compute @workgroup_size( ${shaderData.workgroupSize.join( ', ' )} )
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

	_getOperators() {

		return { // https://www.w3.org/TR/WGSL/#operator-precedence-associativity
			ops: [
				{ ops: [ '[]', '()', '.' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ 'un-', 'un!', 'un~', 'un*', 'un&' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ 'post++', 'post--' ], maxPrec: Infinity, allowSelf: true }, // https://www.w3.org/TR/WGSL/#increment-decrement
				{ ops: [ '*', '/', '%' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '+', '-' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '<<', '>>' ], maxPrec: 1, allowSelf: false },
				{ ops: [ '<', '>', '<=', '>=', '==', '!=' ], maxPrec: Infinity, allowSelf: false },
				{ ops: [ '&' ], maxPrec: 1, allowSelf: true },
				{ ops: [ '^' ], maxPrec: 1, allowSelf: true },
				{ ops: [ '|' ], maxPrec: 1, allowSelf: true },
				{ ops: [ '&&' ], maxPrec: 6, allowSelf: true },
				{ ops: [ '||' ], maxPrec: 6, allowSelf: true },
				{ ops: [ '=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '>>=', '<<=' ], maxPrec: Infinity, allowSelf: true } // https://www.w3.org/TR/WGSL/#compound-assignment-sec
			],
			replace: {
				'&': '&&', // & operator in WGSL is slightly different from GLSL's one, && is closer
				'|': '||', // | operator in WGSL is slightly different from GLSL's one, || is closer
				'^^': '^', // there is no ^^ operator in WGSL

				// there are no prefix increments/decrements in WGSL
				'++': 'post++',
				'pre++': 'post++',
				'--': 'post--',
				'pre--': 'post--'
			}
		};

	}

}

export default WGSLNodeBuilder;
