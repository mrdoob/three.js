import NodeUniformsGroup from '../../common/nodes/NodeUniformsGroup.js';

import NodeSampler from '../../common/nodes/NodeSampler.js';
import { NodeSampledTexture, NodeSampledCubeTexture, NodeSampledTexture3D } from '../../common/nodes/NodeSampledTexture.js';

import NodeUniformBuffer from '../../common/nodes/NodeUniformBuffer.js';
import NodeStorageBuffer from '../../common/nodes/NodeStorageBuffer.js';

import { NodeBuilder, CodeNode } from '../../../nodes/Nodes.js';

import { getFormat } from '../utils/WebGPUTextureUtils.js';

import WGSLNodeParser from './WGSLNodeParser.js';
import { GPUBufferBindingType, GPUStorageTextureAccess } from '../utils/WebGPUConstants.js';

import { NoColorSpace, FloatType, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping } from '../../../constants.js';

// GPUShaderStage is not defined in browsers not supporting WebGPU
const GPUShaderStage = self.GPUShaderStage;

const wrapNames = {
	[ RepeatWrapping ]: 'repeat',
	[ ClampToEdgeWrapping ]: 'clamp',
	[ MirroredRepeatWrapping ]: 'mirror'
};

const gpuShaderStageLib = {
	'vertex': GPUShaderStage ? GPUShaderStage.VERTEX : 1,
	'fragment': GPUShaderStage ? GPUShaderStage.FRAGMENT : 2,
	'compute': GPUShaderStage ? GPUShaderStage.COMPUTE : 4
};

const supports = {
	instance: true,
	swizzleAssign: false,
	storageBuffer: true
};

const wgslFnOpLib = {
	'^^': 'tsl_xor'
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

	mat2: 'mat2x2<f32>',
	mat3: 'mat3x3<f32>',
	mat4: 'mat4x4<f32>'
};

const wgslCodeCache = {};

const wgslPolyfill = {
	tsl_xor: new CodeNode( 'fn tsl_xor( a : bool, b : bool ) -> bool { return ( a || b ) && !( a && b ); }' ),
	mod_float: new CodeNode( 'fn tsl_mod_float( x : f32, y : f32 ) -> f32 { return x - y * floor( x / y ); }' ),
	mod_vec2: new CodeNode( 'fn tsl_mod_vec2( x : vec2f, y : vec2f ) -> vec2f { return x - y * floor( x / y ); }' ),
	mod_vec3: new CodeNode( 'fn tsl_mod_vec3( x : vec3f, y : vec3f ) -> vec3f { return x - y * floor( x / y ); }' ),
	mod_vec4: new CodeNode( 'fn tsl_mod_vec4( x : vec4f, y : vec4f ) -> vec4f { return x - y * floor( x / y ); }' ),
	equals_bool: new CodeNode( 'fn tsl_equals_bool( a : bool, b : bool ) -> bool { return a == b; }' ),
	equals_bvec2: new CodeNode( 'fn tsl_equals_bvec2( a : vec2f, b : vec2f ) -> vec2<bool> { return vec2<bool>( a.x == b.x, a.y == b.y ); }' ),
	equals_bvec3: new CodeNode( 'fn tsl_equals_bvec3( a : vec3f, b : vec3f ) -> vec3<bool> { return vec3<bool>( a.x == b.x, a.y == b.y, a.z == b.z ); }' ),
	equals_bvec4: new CodeNode( 'fn tsl_equals_bvec4( a : vec4f, b : vec4f ) -> vec4<bool> { return vec4<bool>( a.x == b.x, a.y == b.y, a.z == b.z, a.w == b.w ); }' ),
	repeatWrapping_float: new CodeNode( 'fn tsl_repeatWrapping_float( coord: f32 ) -> f32 { return fract( coord ); }' ),
	mirrorWrapping_float: new CodeNode( 'fn tsl_mirrorWrapping_float( coord: f32 ) -> f32 { let mirrored = fract( coord * 0.5 ) * 2.0; return 1.0 - abs( 1.0 - mirrored ); }' ),
	clampWrapping_float: new CodeNode( 'fn tsl_clampWrapping_float( coord: f32 ) -> f32 { return clamp( coord, 0.0, 1.0 ); }' ),
	repeatWrapping: new CodeNode( /* wgsl */`
fn tsl_repeatWrapping( uv : vec2<f32>, dimension : vec2<u32> ) -> vec2<u32> {

	let uvScaled = vec2<u32>( uv * vec2<f32>( dimension ) );

	return ( ( uvScaled % dimension ) + dimension ) % dimension;

}
` ),
	biquadraticTexture: new CodeNode( /* wgsl */`
fn tsl_biquadraticTexture( map : texture_2d<f32>, coord : vec2f, iRes : vec2u, level : i32 ) -> vec4f {

	let res = vec2f( iRes );

	let uvScaled = coord * res;
	let uvWrapping = ( ( uvScaled % res ) + res ) % res;

	// https://www.shadertoy.com/view/WtyXRy

	let uv = uvWrapping - 0.5;
	let iuv = floor( uv );
	let f = fract( uv );

	let rg1 = textureLoad( map, vec2u( iuv + vec2( 0.5, 0.5 ) ) % iRes, level );
	let rg2 = textureLoad( map, vec2u( iuv + vec2( 1.5, 0.5 ) ) % iRes, level );
	let rg3 = textureLoad( map, vec2u( iuv + vec2( 0.5, 1.5 ) ) % iRes, level );
	let rg4 = textureLoad( map, vec2u( iuv + vec2( 1.5, 1.5 ) ) % iRes, level );

	return mix( mix( rg1, rg2, f.x ), mix( rg3, rg4, f.x ), f.y );

}
` )
};

const wgslMethods = {
	dFdx: 'dpdx',
	dFdy: '- dpdy',
	mod_float: 'tsl_mod_float',
	mod_vec2: 'tsl_mod_vec2',
	mod_vec3: 'tsl_mod_vec3',
	mod_vec4: 'tsl_mod_vec4',
	equals_bool: 'tsl_equals_bool',
	equals_bvec2: 'tsl_equals_bvec2',
	equals_bvec3: 'tsl_equals_bvec3',
	equals_bvec4: 'tsl_equals_bvec4',
	inversesqrt: 'inverseSqrt',
	bitcast: 'bitcast<f32>'
};

// WebGPU issue: does not support pow() with negative base on Windows

if ( /Windows/g.test( navigator.userAgent ) ) {

	wgslPolyfill.pow_float = new CodeNode( 'fn tsl_pow_float( a : f32, b : f32 ) -> f32 { return select( -pow( -a, b ), pow( a, b ), a > 0.0 ); }' );
	wgslPolyfill.pow_vec2 = new CodeNode( 'fn tsl_pow_vec2( a : vec2f, b : vec2f ) -> vec2f { return vec2f( tsl_pow_float( a.x, b.x ), tsl_pow_float( a.y, b.y ) ); }', [ wgslPolyfill.pow_float ] );
	wgslPolyfill.pow_vec3 = new CodeNode( 'fn tsl_pow_vec3( a : vec3f, b : vec3f ) -> vec3f { return vec3f( tsl_pow_float( a.x, b.x ), tsl_pow_float( a.y, b.y ), tsl_pow_float( a.z, b.z ) ); }', [ wgslPolyfill.pow_float ] );
	wgslPolyfill.pow_vec4 = new CodeNode( 'fn tsl_pow_vec4( a : vec4f, b : vec4f ) -> vec4f { return vec4f( tsl_pow_float( a.x, b.x ), tsl_pow_float( a.y, b.y ), tsl_pow_float( a.z, b.z ), tsl_pow_float( a.w, b.w ) ); }', [ wgslPolyfill.pow_float ] );

	wgslMethods.pow_float = 'tsl_pow_float';
	wgslMethods.pow_vec2 = 'tsl_pow_vec2';
	wgslMethods.pow_vec3 = 'tsl_pow_vec3';
	wgslMethods.pow_vec4 = 'tsl_pow_vec4';

}

//

let diagnostics = '';

if ( /Firefox|Deno/g.test( navigator.userAgent ) !== true ) {

	diagnostics += 'diagnostic( off, derivative_uniformity );\n';

}

//

class WGSLNodeBuilder extends NodeBuilder {

	constructor( object, renderer ) {

		super( object, renderer, new WGSLNodeParser() );

		this.uniformGroups = {};

		this.builtins = {};

		this.directives = {};

		this.scopedArrays = new Map();

	}

	needsToWorkingColorSpace( texture ) {

		return texture.isVideoTexture === true && texture.colorSpace !== NoColorSpace;

	}

	_generateTextureSample( texture, textureProperty, uvSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			if ( depthSnippet ) {

				return `textureSample( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ depthSnippet } )`;

			} else {

				return `textureSample( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet } )`;

			}

		} else if ( this.isFilteredTexture( texture ) ) {

			return this.generateFilteredTexture( texture, textureProperty, uvSnippet );

		} else {

			return this.generateTextureLod( texture, textureProperty, uvSnippet, '0' );

		}

	}

	_generateVideoSample( textureProperty, uvSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSampleBaseClampToEdge( ${ textureProperty }, ${ textureProperty }_sampler, vec2<f32>( ${ uvSnippet }.x, 1.0 - ${ uvSnippet }.y ) )`;

		} else {

			console.error( `WebGPURenderer: THREE.VideoTexture does not support ${ shaderStage } shader.` );

		}

	}

	_generateTextureSampleLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' && this.isUnfilterable( texture ) === false ) {

			return `textureSampleLevel( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ levelSnippet } )`;

		} else if ( this.isFilteredTexture( texture ) ) {

			return this.generateFilteredTexture( texture, textureProperty, uvSnippet, levelSnippet );

		} else {

			return this.generateTextureLod( texture, textureProperty, uvSnippet, levelSnippet );

		}

	}

	generateWrapFunction( texture ) {

		const functionName = `tsl_coord_${ wrapNames[ texture.wrapS ] }S_${ wrapNames[ texture.wrapT ] }T`;

		let nodeCode = wgslCodeCache[ functionName ];

		if ( nodeCode === undefined ) {

			const includes = [];

			let code = `fn ${ functionName }( coord : vec2f ) -> vec2f {\n\n\treturn vec2f(\n`;

			const addWrapSnippet = ( wrap, axis ) => {

				if ( wrap === RepeatWrapping ) {

					includes.push( wgslPolyfill.repeatWrapping_float );

					code += `\t\ttsl_repeatWrapping_float( coord.${ axis } )`;

				} else if ( wrap === ClampToEdgeWrapping ) {

					includes.push( wgslPolyfill.clampWrapping_float );

					code += `\t\ttsl_clampWrapping_float( coord.${ axis } )`;

				} else if ( wrap === MirroredRepeatWrapping ) {

					includes.push( wgslPolyfill.mirrorWrapping_float );

					code += `\t\ttsl_mirrorWrapping_float( coord.${ axis } )`;

				} else {

					code += `\t\tcoord.${ axis }`;

					console.warn( `WebGPURenderer: Unsupported texture wrap type "${ wrap }" for vertex shader.` );

				}

			};

			addWrapSnippet( texture.wrapS, 'x' );

			code += ',\n';

			addWrapSnippet( texture.wrapT, 'y' );

			code += '\n\t);\n\n}\n';

			wgslCodeCache[ functionName ] = nodeCode = new CodeNode( code, includes );

		}

		nodeCode.build( this );

		return functionName;

	}

	generateTextureDimension( texture, textureProperty, levelSnippet ) {

		const textureData = this.getDataFromNode( texture, this.shaderStage, this.globalCache );

		if ( textureData.dimensionsSnippet === undefined ) textureData.dimensionsSnippet = {};

		let propertyName = textureData.dimensionsSnippet[ levelSnippet ];

		if ( textureData.dimensionsSnippet[ levelSnippet ] === undefined ) {

			propertyName = `textureDimension_${ texture.id }_${ levelSnippet }`;

			this.addLineFlowCode( `let ${ propertyName } = textureDimensions( ${ textureProperty }, i32( ${ levelSnippet } ) );` );

			textureData.dimensionsSnippet[ levelSnippet ] = propertyName;

		}

		return propertyName;

	}

	generateFilteredTexture( texture, textureProperty, uvSnippet, levelSnippet = '0' ) {

		this._include( 'biquadraticTexture' );

		const wrapFunction = this.generateWrapFunction( texture );
		const textureDimension = this.generateTextureDimension( texture, textureProperty, levelSnippet );

		return `tsl_biquadraticTexture( ${ textureProperty }, ${ wrapFunction }( ${ uvSnippet } ), ${ textureDimension }, i32( ${ levelSnippet } ) )`;

	}

	generateTextureLod( texture, textureProperty, uvSnippet, levelSnippet = '0' ) {

		this._include( 'repeatWrapping' );

		const dimension = texture.isMultisampleRenderTargetTexture === true ? `textureDimensions( ${ textureProperty } )` : `textureDimensions( ${ textureProperty }, 0 )`;

		return `textureLoad( ${ textureProperty }, tsl_repeatWrapping( ${ uvSnippet }, ${ dimension } ), i32( ${ levelSnippet } ) )`;

	}

	generateTextureLoad( texture, textureProperty, uvIndexSnippet, depthSnippet, levelSnippet = '0u' ) {

		if ( depthSnippet ) {

			return `textureLoad( ${ textureProperty }, ${ uvIndexSnippet }, ${ depthSnippet }, ${ levelSnippet } )`;

		} else {

			return `textureLoad( ${ textureProperty }, ${ uvIndexSnippet }, ${ levelSnippet } )`;

		}

	}

	generateTextureStore( texture, textureProperty, uvIndexSnippet, valueSnippet ) {

		return `textureStore( ${ textureProperty }, ${ uvIndexSnippet }, ${ valueSnippet } )`;

	}

	isUnfilterable( texture ) {

		return this.getComponentTypeFromTexture( texture ) !== 'float' || ( ! this.isAvailable( 'float32Filterable' ) && texture.isDataTexture === true && texture.type === FloatType ) || texture.isMultisampleRenderTargetTexture === true;

	}

	generateTexture( texture, textureProperty, uvSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		let snippet = null;

		if ( texture.isVideoTexture === true ) {

			snippet = this._generateVideoSample( textureProperty, uvSnippet, shaderStage );

		} else if ( this.isUnfilterable( texture ) ) {

			snippet = this.generateTextureLod( texture, textureProperty, uvSnippet, '0', depthSnippet, shaderStage );

		} else {

			snippet = this._generateTextureSample( texture, textureProperty, uvSnippet, depthSnippet, shaderStage );

		}

		return snippet;

	}

	generateTextureGrad( texture, textureProperty, uvSnippet, gradSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			// TODO handle i32 or u32 --> uvSnippet, array_index: A, ddx, ddy
			return `textureSampleGrad( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet },  ${ gradSnippet[ 0 ] }, ${ gradSnippet[ 1 ] } )`;

		} else {

			console.error( `WebGPURenderer: THREE.TextureNode.gradient() does not support ${ shaderStage } shader.` );

		}

	}

	generateTextureCompare( texture, textureProperty, uvSnippet, compareSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSampleCompare( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ compareSnippet } )`;

		} else {

			console.error( `WebGPURenderer: THREE.DepthTexture.compareFunction() does not support ${ shaderStage } shader.` );

		}

	}

	generateTextureLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		let snippet = null;

		if ( texture.isVideoTexture === true ) {

			snippet = this._generateVideoSample( textureProperty, uvSnippet, shaderStage );

		} else {

			snippet = this._generateTextureSampleLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet, shaderStage );

		}

		return snippet;

	}

	generateTextureBias( texture, textureProperty, uvSnippet, biasSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSampleBias( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ biasSnippet } )`;

		} else {

			console.error( `WebGPURenderer: THREE.TextureNode.biasNode does not support ${ shaderStage } shader.` );

		}

	}

	getPropertyName( node, shaderStage = this.shaderStage ) {

		if ( node.isNodeVarying === true && node.needsInterpolation === true ) {

			if ( shaderStage === 'vertex' ) {

				return `varyings.${ node.name }`;

			}

		} else if ( node.isNodeUniform === true ) {

			const name = node.name;
			const type = node.type;

			if ( type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' || type === 'texture3D' ) {

				return name;

			} else if ( type === 'buffer' || type === 'storageBuffer' || type === 'indirectStorageBuffer' ) {

				return `NodeBuffer_${ node.id }.${name}`;

			} else {

				return node.groupNode.name + '.' + name;

			}

		}

		return super.getPropertyName( node );

	}

	getOutputStructName() {

		return 'output';

	}

	_getUniformGroupCount( shaderStage ) {

		return Object.keys( this.uniforms[ shaderStage ] ).length;

	}

	getFunctionOperator( op ) {

		const fnOp = wgslFnOpLib[ op ];

		if ( fnOp !== undefined ) {

			this._include( fnOp );

			return fnOp;

		}

		return null;

	}

	getStorageAccess( node ) {

		if ( node.isStorageTextureNode ) {

			switch ( node.access ) {

				case GPUStorageTextureAccess.ReadOnly:

					return 'read';

				case GPUStorageTextureAccess.WriteOnly:

					return 'write';

				default:

					return 'read_write';

			}

		} else {

			switch ( node.access ) {

				case GPUBufferBindingType.Storage:

					return 'read_write';


				case GPUBufferBindingType.ReadOnlyStorage:

					return 'read';

				default:

					return 'write';

			}

		}

	}

	getUniformFromNode( node, type, shaderStage, name = null ) {

		const uniformNode = super.getUniformFromNode( node, type, shaderStage, name );
		const nodeData = this.getDataFromNode( node, shaderStage, this.globalCache );

		if ( nodeData.uniformGPU === undefined ) {

			let uniformGPU;

			const group = node.groupNode;
			const groupName = group.name;

			const bindings = this.getBindGroupArray( groupName, shaderStage );

			if ( type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' || type === 'texture3D' ) {

				let texture = null;

				if ( type === 'texture' || type === 'storageTexture' ) {

					texture = new NodeSampledTexture( uniformNode.name, uniformNode.node, group, node.access ? node.access : null );

				} else if ( type === 'cubeTexture' ) {

					texture = new NodeSampledCubeTexture( uniformNode.name, uniformNode.node, group, node.access ? node.access : null );

				} else if ( type === 'texture3D' ) {

					texture = new NodeSampledTexture3D( uniformNode.name, uniformNode.node, group, node.access ? node.access : null );

				}

				texture.store = node.isStorageTextureNode === true;
				texture.setVisibility( gpuShaderStageLib[ shaderStage ] );

				if ( shaderStage === 'fragment' && this.isUnfilterable( node.value ) === false && texture.store === false ) {

					const sampler = new NodeSampler( `${uniformNode.name}_sampler`, uniformNode.node, group );
					sampler.setVisibility( gpuShaderStageLib[ shaderStage ] );

					bindings.push( sampler, texture );

					uniformGPU = [ sampler, texture ];

				} else {

					bindings.push( texture );

					uniformGPU = [ texture ];

				}

			} else if ( type === 'buffer' || type === 'storageBuffer' || type === 'indirectStorageBuffer' ) {

				const bufferClass = type === 'buffer' ? NodeUniformBuffer : NodeStorageBuffer;

				const buffer = new bufferClass( node, group );
				buffer.setVisibility( gpuShaderStageLib[ shaderStage ] );

				bindings.push( buffer );

				uniformGPU = buffer;

			} else {

				const uniformsStage = this.uniformGroups[ shaderStage ] || ( this.uniformGroups[ shaderStage ] = {} );

				let uniformsGroup = uniformsStage[ groupName ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new NodeUniformsGroup( groupName, group );
					uniformsGroup.setVisibility( gpuShaderStageLib[ shaderStage ] );

					uniformsStage[ groupName ] = uniformsGroup;

					bindings.push( uniformsGroup );

				}

				uniformGPU = this.getNodeUniform( uniformNode, type );

				uniformsGroup.addUniform( uniformGPU );

			}

			nodeData.uniformGPU = uniformGPU;

		}

		return uniformNode;

	}

	getBuiltin( name, property, type, shaderStage = this.shaderStage ) {

		const map = this.builtins[ shaderStage ] || ( this.builtins[ shaderStage ] = new Map() );

		if ( map.has( name ) === false ) {

			map.set( name, {
				name,
				property,
				type
			} );

		}

		return property;

	}

	hasBuiltin( name, shaderStage = this.shaderStage ) {

		return ( this.builtins[ shaderStage ] !== undefined && this.builtins[ shaderStage ].has( name ) );

	}

	getVertexIndex() {

		if ( this.shaderStage === 'vertex' ) {

			return this.getBuiltin( 'vertex_index', 'vertexIndex', 'u32', 'attribute' );

		}

		return 'vertexIndex';

	}

	buildFunctionCode( shaderNode ) {

		const layout = shaderNode.layout;
		const flowData = this.flowShaderNode( shaderNode );

		const parameters = [];

		for ( const input of layout.inputs ) {

			parameters.push( input.name + ' : ' + this.getType( input.type ) );

		}

		//

		let code = `fn ${ layout.name }( ${ parameters.join( ', ' ) } ) -> ${ this.getType( layout.type ) } {
${ flowData.vars }
${ flowData.code }
`;

		if ( flowData.result ) {

			code += `\treturn ${ flowData.result };\n`;

		}

		code += '\n}\n';

		//

		return code;

	}

	getInstanceIndex() {

		if ( this.shaderStage === 'vertex' ) {

			return this.getBuiltin( 'instance_index', 'instanceIndex', 'u32', 'attribute' );

		}

		return 'instanceIndex';

	}

	getInvocationLocalIndex() {

		return this.getBuiltin( 'local_invocation_index', 'invocationLocalIndex', 'u32', 'attribute' );

	}

	getSubgroupSize() {

		this.enableSubGroups();

		return this.getBuiltin( 'subgroup_size', 'subgroupSize', 'u32', 'attribute' );

	}

	getInvocationSubgroupIndex() {

		this.enableSubGroups();

		return this.getBuiltin( 'subgroup_invocation_id', 'invocationSubgroupIndex', 'u32', 'attribute' );

	}

	getSubgroupIndex() {

		this.enableSubGroups();

		return this.getBuiltin( 'subgroup_id', 'subgroupIndex', 'u32', 'attribute' );

	}

	getDrawIndex() {

		return null;

	}

	getFrontFacing() {

		return this.getBuiltin( 'front_facing', 'isFront', 'bool' );

	}

	getFragCoord() {

		return this.getBuiltin( 'position', 'fragCoord', 'vec4<f32>' ) + '.xy';

	}

	getFragDepth() {

		return 'output.' + this.getBuiltin( 'frag_depth', 'depth', 'f32', 'output' );

	}

	getClipDistance() {

		return 'varyings.hw_clip_distances';

	}

	isFlipY() {

		return false;

	}

	enableDirective( name, shaderStage = this.shaderStage ) {

		const stage = this.directives[ shaderStage ] || ( this.directives[ shaderStage ] = new Set() );
		stage.add( name );

	}

	getDirectives( shaderStage ) {

		const snippets = [];
		const directives = this.directives[ shaderStage ];

		if ( directives !== undefined ) {

			for ( const directive of directives ) {

				snippets.push( `enable ${directive};` );

			}

		}

		return snippets.join( '\n' );

	}

	enableSubGroups() {

		this.enableDirective( 'subgroups' );

	}

	enableSubgroupsF16() {

		this.enableDirective( 'subgroups-f16' );

	}

	enableClipDistances() {

		this.enableDirective( 'clip_distances' );

	}

	enableShaderF16() {

		this.enableDirective( 'f16' );

	}

	enableDualSourceBlending() {

		this.enableDirective( 'dual_source_blending' );

	}

	enableHardwareClipping( planeCount ) {

		this.enableClipDistances();
		this.getBuiltin( 'clip_distances', 'hw_clip_distances', `array<f32, ${ planeCount } >`, 'vertex' );

	}

	getBuiltins( shaderStage ) {

		const snippets = [];
		const builtins = this.builtins[ shaderStage ];

		if ( builtins !== undefined ) {

			for ( const { name, property, type } of builtins.values() ) {

				snippets.push( `@builtin( ${name} ) ${property} : ${type}` );

			}

		}

		return snippets.join( ',\n\t' );

	}

	getScopedArray( name, scope, bufferType, bufferCount ) {

		if ( this.scopedArrays.has( name ) === false ) {

			this.scopedArrays.set( name, {
				name,
				scope,
				bufferType,
				bufferCount
			} );

		}

		return name;

	}

	getScopedArrays( shaderStage ) {

		if ( shaderStage !== 'compute' ) {

			return;

		}

		const snippets = [];

		for ( const { name, scope, bufferType, bufferCount } of this.scopedArrays.values() ) {

			const type = this.getType( bufferType );

			snippets.push( `var<${scope}> ${name}: array< ${type}, ${bufferCount} >;` );

		}

		return snippets.join( '\n' );

	}

	getAttributes( shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'compute' ) {

			this.getBuiltin( 'global_invocation_id', 'id', 'vec3<u32>', 'attribute' );
			this.getBuiltin( 'workgroup_id', 'workgroupId', 'vec3<u32>', 'attribute' );
			this.getBuiltin( 'local_invocation_id', 'localId', 'vec3<u32>', 'attribute' );
			this.getBuiltin( 'num_workgroups', 'numWorkgroups', 'vec3<u32>', 'attribute' );

			if ( this.renderer.hasFeature( 'subgroups' ) ) {

				this.enableDirective( 'subgroups', shaderStage );
				this.getBuiltin( 'subgroup_size', 'subgroupSize', 'u32', 'attribute' );

			}

		}

		if ( shaderStage === 'vertex' || shaderStage === 'compute' ) {

			const builtins = this.getBuiltins( 'attribute' );

			if ( builtins ) snippets.push( builtins );

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

		const builtins = this.getBuiltins( 'output' );

		if ( builtins ) snippets.push( '\t' + builtins );

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

			snippets.push( `\nvar<private> output : ${ name };\n\n` );

		}

		return snippets.join( '\n\n' );

	}

	getVar( type, name ) {

		return `var ${ name } : ${ this.getType( type ) }`;

	}

	getVars( shaderStage ) {

		const snippets = [];
		const vars = this.vars[ shaderStage ];

		if ( vars !== undefined ) {

			for ( const variable of vars ) {

				snippets.push( `\t${ this.getVar( variable.type, variable.name ) };` );

			}

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

					if ( /^(int|uint|ivec|uvec)/.test( varying.type ) ) {

						attributesSnippet += ' @interpolate( flat )';


					}

					snippets.push( `${ attributesSnippet } ${ varying.name } : ${ this.getType( varying.type ) }` );

				} else if ( shaderStage === 'vertex' && vars.includes( varying ) === false ) {

					vars.push( varying );

				}

			}

		}

		const builtins = this.getBuiltins( shaderStage );

		if ( builtins ) snippets.push( builtins );

		const code = snippets.join( ',\n\t' );

		return shaderStage === 'vertex' ? this._getWGSLStruct( 'VaryingsStruct', '\t' + code ) : code;

	}

	getUniforms( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		const bindingSnippets = [];
		const bufferSnippets = [];
		const structSnippets = [];
		const uniformGroups = {};

		for ( const uniform of uniforms ) {

			const groupName = uniform.groupNode.name;
			const uniformIndexes = this.bindingsIndexes[ groupName ];

			if ( uniform.type === 'texture' || uniform.type === 'cubeTexture' || uniform.type === 'storageTexture' || uniform.type === 'texture3D' ) {

				const texture = uniform.node.value;

				if ( shaderStage === 'fragment' && this.isUnfilterable( texture ) === false && uniform.node.isStorageTextureNode !== true ) {

					if ( texture.isDepthTexture === true && texture.compareFunction !== null ) {

						bindingSnippets.push( `@binding( ${ uniformIndexes.binding ++ } ) @group( ${ uniformIndexes.group } ) var ${ uniform.name }_sampler : sampler_comparison;` );

					} else {

						bindingSnippets.push( `@binding( ${ uniformIndexes.binding ++ } ) @group( ${ uniformIndexes.group } ) var ${ uniform.name }_sampler : sampler;` );

					}

				}

				let textureType;

				let multisampled = '';

				if ( texture.isMultisampleRenderTargetTexture === true ) {

					multisampled = '_multisampled';

				}

				if ( texture.isCubeTexture === true ) {

					textureType = 'texture_cube<f32>';

				} else if ( texture.isDataArrayTexture === true || texture.isCompressedArrayTexture === true ) {

					textureType = 'texture_2d_array<f32>';

				} else if ( texture.isDepthTexture === true ) {

					textureType = `texture_depth${multisampled}_2d`;

				} else if ( texture.isVideoTexture === true ) {

					textureType = 'texture_external';

				} else if ( texture.isData3DTexture === true ) {

					textureType = 'texture_3d<f32>';

				} else if ( uniform.node.isStorageTextureNode === true ) {

					const format = getFormat( texture );
					const access = this.getStorageAccess( uniform.node );

					textureType = `texture_storage_2d<${ format }, ${ access }>`;

				} else {

					const componentPrefix = this.getComponentTypeFromTexture( texture ).charAt( 0 );

					textureType = `texture${multisampled}_2d<${ componentPrefix }32>`;

				}

				bindingSnippets.push( `@binding( ${ uniformIndexes.binding ++ } ) @group( ${ uniformIndexes.group } ) var ${ uniform.name } : ${ textureType };` );

			} else if ( uniform.type === 'buffer' || uniform.type === 'storageBuffer' || uniform.type === 'indirectStorageBuffer' ) {

				const bufferNode = uniform.node;
				const bufferType = this.getType( bufferNode.bufferType );
				const bufferCount = bufferNode.bufferCount;

				const bufferCountSnippet = bufferCount > 0 && uniform.type === 'buffer' ? ', ' + bufferCount : '';
				const bufferTypeSnippet = bufferNode.isAtomic ? `atomic<${bufferType}>` : `${bufferType}`;
				const bufferSnippet = `\t${ uniform.name } : array< ${ bufferTypeSnippet }${ bufferCountSnippet } >\n`;
				const bufferAccessMode = bufferNode.isStorageBufferNode ? `storage, ${ this.getStorageAccess( bufferNode ) }` : 'uniform';

				bufferSnippets.push( this._getWGSLStructBinding( 'NodeBuffer_' + bufferNode.id, bufferSnippet, bufferAccessMode, uniformIndexes.binding ++, uniformIndexes.group ) );

			} else {

				const vectorType = this.getType( this.getVectorType( uniform.type ) );
				const groupName = uniform.groupNode.name;

				const group = uniformGroups[ groupName ] || ( uniformGroups[ groupName ] = {
					index: uniformIndexes.binding ++,
					id: uniformIndexes.group,
					snippets: []
				} );

				group.snippets.push( `\t${ uniform.name } : ${ vectorType }` );

			}

		}

		for ( const name in uniformGroups ) {

			const group = uniformGroups[ name ];

			structSnippets.push( this._getWGSLStructBinding( name, group.snippets.join( ',\n' ), 'uniform', group.index, group.id ) );

		}

		let code = bindingSnippets.join( '\n' );
		code += bufferSnippets.join( '\n' );
		code += structSnippets.join( '\n' );

		return code;

	}

	buildCode() {

		const shadersData = this.material !== null ? { fragment: {}, vertex: {} } : { compute: {} };

		this.sortBindingGroups();

		for ( const shaderStage in shadersData ) {

			const stageData = shadersData[ shaderStage ];
			stageData.uniforms = this.getUniforms( shaderStage );
			stageData.attributes = this.getAttributes( shaderStage );
			stageData.varyings = this.getVaryings( shaderStage );
			stageData.structs = this.getStructs( shaderStage );
			stageData.vars = this.getVars( shaderStage );
			stageData.codes = this.getCodes( shaderStage );
			stageData.directives = this.getDirectives( shaderStage );
			stageData.scopedArrays = this.getScopedArrays( shaderStage );

			//

			let flow = '// code\n\n';
			flow += this.flowCode[ shaderStage ];

			const flowNodes = this.flowNodes[ shaderStage ];
			const mainNode = flowNodes[ flowNodes.length - 1 ];

			const outputNode = mainNode.outputNode;
			const isOutputStruct = ( outputNode !== undefined && outputNode.isOutputStructNode === true );

			for ( const node of flowNodes ) {

				const flowSlotData = this.getFlowData( node/*, shaderStage*/ );
				const slotName = node.name;

				if ( slotName ) {

					if ( flow.length > 0 ) flow += '\n';

					flow += `\t// flow -> ${ slotName }\n\t`;

				}

				flow += `${ flowSlotData.code }\n\t`;

				if ( node === mainNode && shaderStage !== 'compute' ) {

					flow += '// result\n\n\t';

					if ( shaderStage === 'vertex' ) {

						flow += `varyings.Vertex = ${ flowSlotData.result };`;

					} else if ( shaderStage === 'fragment' ) {

						if ( isOutputStruct ) {

							stageData.returnType = outputNode.nodeType;

							flow += `return ${ flowSlotData.result };`;

						} else {

							let structSnippet = '\t@location(0) color: vec4<f32>';

							const builtins = this.getBuiltins( 'output' );

							if ( builtins ) structSnippet += ',\n\t' + builtins;

							stageData.returnType = 'OutputStruct';
							stageData.structs += this._getWGSLStruct( 'OutputStruct', structSnippet );
							stageData.structs += '\nvar<private> output : OutputStruct;\n\n';

							flow += `output.color = ${ flowSlotData.result };\n\n\treturn output;`;

						}

					}

				}

			}

			stageData.flow = flow;


		}

		if ( this.material !== null ) {

			this.vertexShader = this._getWGSLVertexCode( shadersData.vertex );
			this.fragmentShader = this._getWGSLFragmentCode( shadersData.fragment );

		} else {

			this.computeShader = this._getWGSLComputeCode( shadersData.compute, ( this.object.workgroupSize || [ 64 ] ).join( ', ' ) );

		}

	}

	getMethod( method, output = null ) {

		let wgslMethod;

		if ( output !== null ) {

			wgslMethod = this._getWGSLMethod( method + '_' + output );

		}

		if ( wgslMethod === undefined ) {

			wgslMethod = this._getWGSLMethod( method );

		}

		return wgslMethod || method;

	}

	getType( type ) {

		return wgslTypeLib[ type ] || type;

	}

	isAvailable( name ) {

		let result = supports[ name ];

		if ( result === undefined ) {

			if ( name === 'float32Filterable' ) {

				result = this.renderer.hasFeature( 'float32-filterable' );

			} else if ( name === 'clipDistance' ) {

				result = this.renderer.hasFeature( 'clip-distances' );

			}

			supports[ name ] = result;

		}

		return result;

	}

	_getWGSLMethod( method ) {

		if ( wgslPolyfill[ method ] !== undefined ) {

			this._include( method );

		}

		return wgslMethods[ method ];

	}

	_include( name ) {

		const codeNode = wgslPolyfill[ name ];
		codeNode.build( this );

		if ( this.currentFunctionNode !== null ) {

			this.currentFunctionNode.includes.push( codeNode );

		}

		return codeNode;

	}

	_getWGSLVertexCode( shaderData ) {

		return `${ this.getSignature() }
// directives
${shaderData.directives}

// uniforms
${shaderData.uniforms}

// varyings
${shaderData.varyings}
var<private> varyings : VaryingsStruct;

// codes
${shaderData.codes}

@vertex
fn main( ${shaderData.attributes} ) -> VaryingsStruct {

	// vars
	${shaderData.vars}

	// flow
	${shaderData.flow}

	return varyings;

}
`;

	}

	_getWGSLFragmentCode( shaderData ) {

		return `${ this.getSignature() }
// global
${ diagnostics }

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
// directives
${shaderData.directives}

// system
var<private> instanceIndex : u32;

// locals
${shaderData.scopedArrays}

// uniforms
${shaderData.uniforms}

// codes
${shaderData.codes}

@compute @workgroup_size( ${workgroupSize} )
fn main( ${shaderData.attributes} ) {

	// system
	instanceIndex = id.x + id.y * numWorkgroups.x * u32(${workgroupSize}) + id.z * numWorkgroups.x * numWorkgroups.y * u32(${workgroupSize});

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
