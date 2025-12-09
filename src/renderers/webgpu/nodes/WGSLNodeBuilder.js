import NodeUniformsGroup from '../../common/nodes/NodeUniformsGroup.js';

import NodeSampler from '../../common/nodes/NodeSampler.js';
import { NodeSampledTexture, NodeSampledCubeTexture, NodeSampledTexture3D } from '../../common/nodes/NodeSampledTexture.js';

import NodeUniformBuffer from '../../common/nodes/NodeUniformBuffer.js';
import NodeStorageBuffer from '../../common/nodes/NodeStorageBuffer.js';

import { NodeBuilder, CodeNode } from '../../../nodes/Nodes.js';

import { getFormat } from '../utils/WebGPUTextureUtils.js';

import WGSLNodeParser from './WGSLNodeParser.js';
import { NodeAccess } from '../../../nodes/core/constants.js';

import VarNode from '../../../nodes/core/VarNode.js';
import ExpressionNode from '../../../nodes/code/ExpressionNode.js';

import { FloatType, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping, NearestFilter } from '../../../constants.js';
import { warn, error } from '../../../utils.js';

import { GPUShaderStage } from '../utils/WebGPUConstants.js';

const accessNames = {
	[ NodeAccess.READ_ONLY ]: 'read',
	[ NodeAccess.WRITE_ONLY ]: 'write',
	[ NodeAccess.READ_WRITE ]: 'read_write'
};

const wrapNames = {
	[ RepeatWrapping ]: 'repeat',
	[ ClampToEdgeWrapping ]: 'clamp',
	[ MirroredRepeatWrapping ]: 'mirror'
};

const gpuShaderStageLib = {
	'vertex': GPUShaderStage.VERTEX,
	'fragment': GPUShaderStage.FRAGMENT,
	'compute': GPUShaderStage.COMPUTE
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
	biquadraticTexture: new CodeNode( /* wgsl */`
fn tsl_biquadraticTexture( map : texture_2d<f32>, coord : vec2f, iRes : vec2u, level : u32 ) -> vec4f {

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
	bitcast: 'bitcast<f32>',
	floatpack_snorm_2x16: 'pack2x16snorm',
	floatpack_unorm_2x16: 'pack2x16unorm',
	floatpack_float16_2x16: 'pack2x16float',
	floatunpack_snorm_2x16: 'unpack2x16snorm',
	floatunpack_unorm_2x16: 'unpack2x16unorm',
	floatunpack_float16_2x16: 'unpack2x16float'
};

//

let diagnostics = '';

if ( ( typeof navigator !== 'undefined' && /Firefox|Deno/g.test( navigator.userAgent ) ) !== true ) {

	diagnostics += 'diagnostic( off, derivative_uniformity );\n';

}

/**
 * A node builder targeting WGSL.
 *
 * This module generates WGSL shader code from node materials and also
 * generates the respective bindings and vertex buffer definitions. These
 * data are later used by the renderer to create render and compute pipelines
 * for render objects.
 *
 * @augments NodeBuilder
 */
class WGSLNodeBuilder extends NodeBuilder {

	/**
	 * Constructs a new WGSL node builder renderer.
	 *
	 * @param {Object3D} object - The 3D object.
	 * @param {Renderer} renderer - The renderer.
	 */
	constructor( object, renderer ) {

		super( object, renderer, new WGSLNodeParser() );

		/**
		 * A dictionary that holds for each shader stage ('vertex', 'fragment', 'compute')
		 * another dictionary which manages UBOs per group ('render','frame','object').
		 *
		 * @type {Object<string,Object<string,NodeUniformsGroup>>}
		 */
		this.uniformGroups = {};

		/**
		 * A dictionary that holds for each shader stage a Map of builtins.
		 *
		 * @type {Object<string,Map<string,Object>>}
		 */
		this.builtins = {};

		/**
		 * A dictionary that holds for each shader stage a Set of directives.
		 *
		 * @type {Object<string,Set<string>>}
		 */
		this.directives = {};

		/**
		 * A map for managing scope arrays. Only relevant for when using
		 * {@link WorkgroupInfoNode} in context of compute shaders.
		 *
		 * @type {Map<string,Object>}
		 */
		this.scopedArrays = new Map();

	}

	/**
	 * Generates the WGSL snippet for sampled textures.
	 *
	 * @private
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A WGSL snippet that represents texture coordinates used for sampling.
	 * @param {?string} depthSnippet - A WGSL snippet that represents 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage this code snippet is generated for.
	 * @return {string} The WGSL snippet.
	 */
	_generateTextureSample( texture, textureProperty, uvSnippet, depthSnippet, offsetSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			if ( depthSnippet ) {

				if ( offsetSnippet ) {

					return `textureSample( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ depthSnippet }, ${ offsetSnippet } )`;

				}

				return `textureSample( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ depthSnippet } )`;

			} else {

				if ( offsetSnippet ) {

					return `textureSample( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ offsetSnippet } )`;

				}

				return `textureSample( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet } )`;

			}

		} else {

			return this.generateTextureSampleLevel( texture, textureProperty, uvSnippet, '0', depthSnippet );

		}

	}

	/**
	 * Generates the WGSL snippet when sampling textures with explicit mip level.
	 *
	 * @private
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A WGSL snippet that represents texture coordinates used for sampling.
	 * @param {string} levelSnippet - A WGSL snippet that represents the mip level, with level 0 containing a full size version of the texture.
	 * @param {string} depthSnippet - A WGSL snippet that represents 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @return {string} The WGSL snippet.
	 */
	generateTextureSampleLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet, offsetSnippet ) {

		if ( this.isUnfilterable( texture ) === false ) {

			if ( offsetSnippet ) {

				return `textureSampleLevel( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ levelSnippet }, ${ offsetSnippet } )`;

			}

			return `textureSampleLevel( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ levelSnippet } )`;

		} else if ( this.isFilteredTexture( texture ) ) {

			return this.generateFilteredTexture( texture, textureProperty, uvSnippet, offsetSnippet, levelSnippet );

		} else {

			return this.generateTextureLod( texture, textureProperty, uvSnippet, depthSnippet, offsetSnippet, levelSnippet );

		}

	}

	/**
	 * Generates a wrap function used in context of textures.
	 *
	 * @param {Texture} texture - The texture to generate the function for.
	 * @return {string} The name of the generated function.
	 */
	generateWrapFunction( texture ) {

		const functionName = `tsl_coord_${ wrapNames[ texture.wrapS ] }S_${ wrapNames[ texture.wrapT ] }_${ texture.is3DTexture || texture.isData3DTexture ? '3d' : '2d' }T`;

		let nodeCode = wgslCodeCache[ functionName ];

		if ( nodeCode === undefined ) {

			const includes = [];

			// For 3D textures, use vec3f; for texture arrays, keep vec2f since array index is separate
			const coordType = texture.is3DTexture || texture.isData3DTexture ? 'vec3f' : 'vec2f';
			let code = `fn ${ functionName }( coord : ${ coordType } ) -> ${ coordType } {\n\n\treturn ${ coordType }(\n`;

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

					warn( `WebGPURenderer: Unsupported texture wrap type "${ wrap }" for vertex shader.` );

				}

			};

			addWrapSnippet( texture.wrapS, 'x' );

			code += ',\n';

			addWrapSnippet( texture.wrapT, 'y' );

			if ( texture.is3DTexture || texture.isData3DTexture ) {

				code += ',\n';
				addWrapSnippet( texture.wrapR, 'z' );

			}

			code += '\n\t);\n\n}\n';

			wgslCodeCache[ functionName ] = nodeCode = new CodeNode( code, includes );

		}

		nodeCode.build( this );

		return functionName;

	}

	/**
	 * Generates the array declaration string.
	 *
	 * @param {string} type - The type.
	 * @param {?number} [count] - The count.
	 * @return {string} The generated value as a shader string.
	 */
	generateArrayDeclaration( type, count ) {

		return `array< ${ this.getType( type ) }, ${ count } >`;

	}

	/**
	 * Generates a WGSL variable that holds the texture dimension of the given texture.
	 * It also returns information about the number of layers (elements) of an arrayed
	 * texture as well as the cube face count of cube textures.
	 *
	 * @param {Texture} texture - The texture to generate the function for.
	 * @param {string} textureProperty - The name of the video texture uniform in the shader.
	 * @param {string} levelSnippet - A WGSL snippet that represents the mip level, with level 0 containing a full size version of the texture.
	 * @return {string} The name of the dimension variable.
	 */
	generateTextureDimension( texture, textureProperty, levelSnippet ) {

		const textureData = this.getDataFromNode( texture, this.shaderStage, this.globalCache );

		if ( textureData.dimensionsSnippet === undefined ) textureData.dimensionsSnippet = {};

		let textureDimensionNode = textureData.dimensionsSnippet[ levelSnippet ];

		if ( textureData.dimensionsSnippet[ levelSnippet ] === undefined ) {

			let textureDimensionsParams;
			let dimensionType;

			const { primarySamples } = this.renderer.backend.utils.getTextureSampleData( texture );
			const isMultisampled = primarySamples > 1;

			if ( texture.is3DTexture || texture.isData3DTexture ) {

				dimensionType = 'vec3<u32>';

			} else {

				// Regular 2D textures, depth textures, etc.
				dimensionType = 'vec2<u32>';

			}

			// Build parameters string based on texture type and multisampling
			if ( isMultisampled || texture.isStorageTexture ) {

				textureDimensionsParams = textureProperty;

			} else {

				textureDimensionsParams = `${textureProperty}${levelSnippet ? `, u32( ${ levelSnippet } )` : ''}`;

			}

			textureDimensionNode = new VarNode( new ExpressionNode( `textureDimensions( ${ textureDimensionsParams } )`, dimensionType ) );

			textureData.dimensionsSnippet[ levelSnippet ] = textureDimensionNode;

			if ( texture.isArrayTexture || texture.isDataArrayTexture || texture.is3DTexture || texture.isData3DTexture ) {

				textureData.arrayLayerCount = new VarNode(
					new ExpressionNode(
						`textureNumLayers(${textureProperty})`,
						'u32'
					)
				);

			}

			// For cube textures, we know it's always 6 faces
			if ( texture.isTextureCube ) {

				textureData.cubeFaceCount = new VarNode(
					new ExpressionNode( '6u', 'u32' )
				);

			}

		}

		return textureDimensionNode.build( this );

	}

	/**
	 * Generates the WGSL snippet for a manual filtered texture.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A WGSL snippet that represents texture coordinates used for sampling.
	 * @param {?string} offsetSnippet - A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @param {string} [levelSnippet='0u'] - A WGSL snippet that represents the mip level, with level 0 containing a full size version of the texture.
	 * @return {string} The WGSL snippet.
	 */
	generateFilteredTexture( texture, textureProperty, uvSnippet, offsetSnippet, levelSnippet = '0u' ) {

		this._include( 'biquadraticTexture' );

		const wrapFunction = this.generateWrapFunction( texture );
		const textureDimension = this.generateTextureDimension( texture, textureProperty, levelSnippet );

		if ( offsetSnippet ) {

			uvSnippet = `${ uvSnippet } + vec2<f32>(${ offsetSnippet }) / ${ textureDimension }`;

		}

		return `tsl_biquadraticTexture( ${ textureProperty }, ${ wrapFunction }( ${ uvSnippet } ), ${ textureDimension }, u32( ${ levelSnippet } ) )`;

	}

	/**
	 * Generates the WGSL snippet for a texture lookup with explicit level-of-detail.
	 * Since it's a lookup, no sampling or filtering is applied.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A WGSL snippet that represents texture coordinates used for sampling.
	 * @param {?string} depthSnippet - A WGSL snippet that represents 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @param {string} [levelSnippet='0u'] - A WGSL snippet that represents the mip level, with level 0 containing a full size version of the texture.
	 * @return {string} The WGSL snippet.
	 */
	generateTextureLod( texture, textureProperty, uvSnippet, depthSnippet, offsetSnippet, levelSnippet = '0u' ) {

		const wrapFunction = this.generateWrapFunction( texture );
		const textureDimension = this.generateTextureDimension( texture, textureProperty, levelSnippet );

		const vecType = texture.is3DTexture || texture.isData3DTexture ? 'vec3' : 'vec2';

		if ( offsetSnippet ) {

			uvSnippet = `${ uvSnippet } + ${ vecType }<f32>(${ offsetSnippet }) / ${ vecType }<f32>( ${ textureDimension } )`;

		}

		const coordSnippet = `${ vecType }<u32>( ${ wrapFunction }( ${ uvSnippet } ) * ${ vecType }<f32>( ${ textureDimension } ) )`;

		return this.generateTextureLoad( texture, textureProperty, coordSnippet, levelSnippet, depthSnippet, null );

	}

	/**
	 * Generates the WGSL snippet that reads a single texel from a texture without sampling or filtering.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvIndexSnippet - A WGSL snippet that represents texture coordinates used for sampling.
	 * @param {?string} levelSnippet - A WGSL snippet that represents the mip level, with level 0 containing a full size version of the texture.
	 * @param {?string} depthSnippet - A WGSL snippet that represents 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @return {string} The WGSL snippet.
	 */
	generateTextureLoad( texture, textureProperty, uvIndexSnippet, levelSnippet, depthSnippet, offsetSnippet ) {

		if ( levelSnippet === null ) levelSnippet = '0u';

		if ( offsetSnippet ) {

			uvIndexSnippet = `${ uvIndexSnippet } + ${ offsetSnippet }`;

		}

		let snippet;

		if ( depthSnippet ) {

			snippet = `textureLoad( ${ textureProperty }, ${ uvIndexSnippet }, ${ depthSnippet }, u32( ${ levelSnippet } ) )`;

		} else {

			snippet = `textureLoad( ${ textureProperty }, ${ uvIndexSnippet }, u32( ${ levelSnippet } ) )`;

			if ( this.renderer.backend.compatibilityMode && texture.isDepthTexture ) {

				snippet += '.x';

			}

		}

		return snippet;

	}

	/**
	 * Generates the WGSL snippet that writes a single texel to a texture.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvIndexSnippet - A WGSL snippet that represents texture coordinates used for sampling.
	 * @param {?string} depthSnippet - A WGSL snippet that represents 0-based texture array index to sample.
	 * @param {string} valueSnippet - A WGSL snippet that represent the new texel value.
	 * @return {string} The WGSL snippet.
	 */
	generateTextureStore( texture, textureProperty, uvIndexSnippet, depthSnippet, valueSnippet ) {

		let snippet;

		if ( depthSnippet ) {

			snippet = `textureStore( ${ textureProperty }, ${ uvIndexSnippet }, ${ depthSnippet }, ${ valueSnippet } )`;

		} else {

			snippet = `textureStore( ${ textureProperty }, ${ uvIndexSnippet }, ${ valueSnippet } )`;

		}

		return snippet;

	}

	/**
	 * Returns `true` if the sampled values of the given texture should be compared against a reference value.
	 *
	 * @param {Texture} texture - The texture.
	 * @return {boolean} Whether the sampled values of the given texture should be compared against a reference value or not.
	 */
	isSampleCompare( texture ) {

		return texture.isDepthTexture === true && texture.compareFunction !== null;

	}

	/**
	 * Returns `true` if the given texture is unfilterable.
	 *
	 * @param {Texture} texture - The texture.
	 * @return {boolean} Whether the given texture is unfilterable or not.
	 */
	isUnfilterable( texture ) {

		return this.getComponentTypeFromTexture( texture ) !== 'float' ||
			( ! this.isAvailable( 'float32Filterable' ) && texture.isDataTexture === true && texture.type === FloatType ) ||
			( this.isSampleCompare( texture ) === false && texture.minFilter === NearestFilter && texture.magFilter === NearestFilter ) ||
			this.renderer.backend.utils.getTextureSampleData( texture ).primarySamples > 1;

	}

	/**
	 * Generates the WGSL snippet for sampling/loading the given texture.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A WGSL snippet that represents texture coordinates used for sampling.
	 * @param {?string} depthSnippet - A WGSL snippet that represents 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage this code snippet is generated for.
	 * @return {string} The WGSL snippet.
	 */
	generateTexture( texture, textureProperty, uvSnippet, depthSnippet, offsetSnippet, shaderStage = this.shaderStage ) {

		let snippet = null;

		if ( this.isUnfilterable( texture ) ) {

			snippet = this.generateTextureLod( texture, textureProperty, uvSnippet, depthSnippet, offsetSnippet, '0', shaderStage );

		} else {

			snippet = this._generateTextureSample( texture, textureProperty, uvSnippet, depthSnippet, offsetSnippet, shaderStage );

		}

		return snippet;

	}

	/**
	 * Generates the WGSL snippet for sampling/loading the given texture using explicit gradients.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A WGSL snippet that represents texture coordinates used for sampling.
	 * @param {Array<string>} gradSnippet - An array holding both gradient WGSL snippets.
	 * @param {?string} depthSnippet - A WGSL snippet that represents 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage this code snippet is generated for.
	 * @return {string} The WGSL snippet.
	 */
	generateTextureGrad( texture, textureProperty, uvSnippet, gradSnippet, depthSnippet, offsetSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			// TODO handle i32 or u32 --> uvSnippet, array_index: A, ddx, ddy
			if ( offsetSnippet ) {

				return `textureSampleGrad( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet },  ${ gradSnippet[ 0 ] }, ${ gradSnippet[ 1 ] }, ${ offsetSnippet } )`;

			}

			return `textureSampleGrad( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet },  ${ gradSnippet[ 0 ] }, ${ gradSnippet[ 1 ] } )`;

		} else {

			error( `WebGPURenderer: THREE.TextureNode.gradient() does not support ${ shaderStage } shader.` );

		}

	}

	/**
	 * Generates the WGSL snippet for sampling a depth texture and comparing the sampled depth values
	 * against a reference value.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A WGSL snippet that represents texture coordinates used for sampling.
	 * @param {string} compareSnippet -  A WGSL snippet that represents the reference value.
	 * @param {?string} depthSnippet - A WGSL snippet that represents 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage this code snippet is generated for.
	 * @return {string} The WGSL snippet.
	 */
	generateTextureCompare( texture, textureProperty, uvSnippet, compareSnippet, depthSnippet, offsetSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			if ( texture.isDepthTexture === true && texture.isArrayTexture === true ) {

				if ( offsetSnippet ) {

					return `textureSampleCompare( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ depthSnippet }, ${ compareSnippet }, ${ offsetSnippet } )`;

				}

				return `textureSampleCompare( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ depthSnippet }, ${ compareSnippet } )`;

			}

			if ( offsetSnippet ) {

				return `textureSampleCompare( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ compareSnippet }, ${ offsetSnippet } )`;

			}

			return `textureSampleCompare( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ compareSnippet } )`;

		} else {

			error( `WebGPURenderer: THREE.DepthTexture.compareFunction() does not support ${ shaderStage } shader.` );

		}

	}

	/**
	 * Generates the WGSL snippet when sampling textures with explicit mip level.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A WGSL snippet that represents texture coordinates used for sampling.
	 * @param {string} levelSnippet - A WGSL snippet that represents the mip level, with level 0 containing a full size version of the texture.
	 * @param {?string} depthSnippet - A WGSL snippet that represents 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage this code snippet is generated for.
	 * @return {string} The WGSL snippet.
	 */
	generateTextureLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet, offsetSnippet ) {

		if ( this.isUnfilterable( texture ) === false ) {

			if ( offsetSnippet ) {

				return `textureSampleLevel( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ levelSnippet }, ${ offsetSnippet } )`;

			}

			return `textureSampleLevel( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ levelSnippet } )`;

		} else if ( this.isFilteredTexture( texture ) ) {

			return this.generateFilteredTexture( texture, textureProperty, uvSnippet, offsetSnippet, levelSnippet );

		} else {

			return this.generateTextureLod( texture, textureProperty, uvSnippet, depthSnippet, offsetSnippet, levelSnippet );

		}

	}

	/**
	 * Generates the WGSL snippet when sampling textures with a bias to the mip level.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A WGSL snippet that represents texture coordinates used for sampling.
	 * @param {string} biasSnippet - A WGSL snippet that represents the bias to apply to the mip level before sampling.
	 * @param {?string} depthSnippet - A WGSL snippet that represents 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A WGSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage this code snippet is generated for.
	 * @return {string} The WGSL snippet.
	 */
	generateTextureBias( texture, textureProperty, uvSnippet, biasSnippet, depthSnippet, offsetSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			if ( offsetSnippet ) {

				return `textureSampleBias( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ biasSnippet }, ${ offsetSnippet } )`;

			}

			return `textureSampleBias( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ biasSnippet } )`;

		} else {

			error( `WebGPURenderer: THREE.TextureNode.biasNode does not support ${ shaderStage } shader.` );

		}

	}

	/**
	 * Returns a WGSL snippet that represents the property name of the given node.
	 *
	 * @param {Node} node - The node.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage this code snippet is generated for.
	 * @return {string} The property name.
	 */
	getPropertyName( node, shaderStage = this.shaderStage ) {

		if ( node.isNodeVarying === true && node.needsInterpolation === true ) {

			if ( shaderStage === 'vertex' ) {

				return `varyings.${ node.name }`;

			}

		} else if ( node.isNodeUniform === true ) {

			const name = node.name;
			const type = node.type;

			if ( type === 'texture' || type === 'cubeTexture' || type === 'cubeDepthTexture' || type === 'storageTexture' || type === 'texture3D' ) {

				return name;

			} else if ( type === 'buffer' || type === 'storageBuffer' || type === 'indirectStorageBuffer' ) {

				if ( this.isCustomStruct( node ) ) {

					return name;

				}

				return name + '.value';

			} else {

				return node.groupNode.name + '.' + name;

			}

		}

		return super.getPropertyName( node );

	}

	/**
	 * Returns the output struct name.
	 *
	 * @return {string} The name of the output struct.
	 */
	getOutputStructName() {

		return 'output';

	}

	/**
	 * Returns the native shader operator name for a given generic name.
	 *
	 * @param {string} op - The operator name to resolve.
	 * @return {?string} The resolved operator name.
	 */
	getFunctionOperator( op ) {

		const fnOp = wgslFnOpLib[ op ];

		if ( fnOp !== undefined ) {

			this._include( fnOp );

			return fnOp;

		}

		return null;

	}

	/**
	 * Returns the node access for the given node and shader stage.
	 *
	 * @param {StorageTextureNode|StorageBufferNode} node - The storage node.
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The node access.
	 */
	getNodeAccess( node, shaderStage ) {

		if ( shaderStage !== 'compute' ) {

			if ( node.isAtomic === true ) {

				warn( 'WebGPURenderer: Atomic operations are only supported in compute shaders.' );

				return NodeAccess.READ_WRITE;

			}

			return NodeAccess.READ_ONLY;

		}

		return node.access;

	}

	/**
	 * Returns A WGSL snippet representing the storage access.
	 *
	 * @param {StorageTextureNode|StorageBufferNode} node - The storage node.
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The WGSL snippet representing the storage access.
	 */
	getStorageAccess( node, shaderStage ) {

		return accessNames[ this.getNodeAccess( node, shaderStage ) ];

	}

	/**
	 * This method is one of the more important ones since it's responsible
	 * for generating a matching binding instance for the given uniform node.
	 *
	 * These bindings are later used in the renderer to create bind groups
	 * and layouts.
	 *
	 * @param {UniformNode} node - The uniform node.
	 * @param {string} type - The node data type.
	 * @param {string} shaderStage - The shader stage.
	 * @param {?string} [name=null] - An optional uniform name.
	 * @return {NodeUniform} The node uniform object.
	 */
	getUniformFromNode( node, type, shaderStage, name = null ) {

		const uniformNode = super.getUniformFromNode( node, type, shaderStage, name );
		const nodeData = this.getDataFromNode( node, shaderStage, this.globalCache );

		if ( nodeData.uniformGPU === undefined ) {

			let uniformGPU;

			const group = node.groupNode;
			const groupName = group.name;

			const bindings = this.getBindGroupArray( groupName, shaderStage );

			if ( type === 'texture' || type === 'cubeTexture' || type === 'cubeDepthTexture' || type === 'storageTexture' || type === 'texture3D' ) {

				let texture = null;

				const access = this.getNodeAccess( node, shaderStage );

				if ( type === 'texture' || type === 'storageTexture' ) {

					if ( node.value.is3DTexture === true ) {

						texture = new NodeSampledTexture3D( uniformNode.name, uniformNode.node, group, access );

					} else {

						texture = new NodeSampledTexture( uniformNode.name, uniformNode.node, group, access );

					}

				} else if ( type === 'cubeTexture' || type === 'cubeDepthTexture' ) {

					texture = new NodeSampledCubeTexture( uniformNode.name, uniformNode.node, group, access );

				} else if ( type === 'texture3D' ) {

					texture = new NodeSampledTexture3D( uniformNode.name, uniformNode.node, group, access );

				}

				texture.store = node.isStorageTextureNode === true;
				texture.mipLevel = texture.store ? node.mipLevel : 0;
				texture.setVisibility( gpuShaderStageLib[ shaderStage ] );

				if ( this.isUnfilterable( node.value ) === false && texture.store === false ) {

					const sampler = new NodeSampler( `${ uniformNode.name }_sampler`, uniformNode.node, group );
					sampler.setVisibility( gpuShaderStageLib[ shaderStage ] );

					bindings.push( sampler, texture );

					uniformGPU = [ sampler, texture ];

				} else {

					bindings.push( texture );

					uniformGPU = [ texture ];

				}

			} else if ( type === 'buffer' || type === 'storageBuffer' || type === 'indirectStorageBuffer' ) {

				const sharedData = this.getSharedDataFromNode( node );

				let buffer = sharedData.buffer;

				if ( buffer === undefined ) {

					const bufferClass = type === 'buffer' ? NodeUniformBuffer : NodeStorageBuffer;

					buffer = new bufferClass( node, group );

					sharedData.buffer = buffer;

				}

				buffer.setVisibility( buffer.getVisibility() | gpuShaderStageLib[ shaderStage ] );

				bindings.push( buffer );

				uniformGPU = buffer;

				uniformNode.name = name ? name : 'NodeBuffer_' + uniformNode.id;

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

	/**
	 * This method should be used whenever builtins are required in nodes.
	 * The internal builtins data structure will make sure builtins are
	 * defined in the WGSL source.
	 *
	 * @param {string} name - The builtin name.
	 * @param {string} property - The property name.
	 * @param {string} type - The node data type.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage this code snippet is generated for.
	 * @return {string} The property name.
	 */
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

	/**
	 * Returns `true` if the given builtin is defined in the given shader stage.
	 *
	 * @param {string} name - The builtin name.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage this code snippet is generated for.
	 * @return {boolean} Whether the given builtin is defined in the given shader stage or not.
	 */
	hasBuiltin( name, shaderStage = this.shaderStage ) {

		return ( this.builtins[ shaderStage ] !== undefined && this.builtins[ shaderStage ].has( name ) );

	}

	/**
	 * Returns the vertex index builtin.
	 *
	 * @return {string} The vertex index.
	 */
	getVertexIndex() {

		if ( this.shaderStage === 'vertex' ) {

			return this.getBuiltin( 'vertex_index', 'vertexIndex', 'u32', 'attribute' );

		}

		return 'vertexIndex';

	}

	/**
	 * Builds the given shader node.
	 *
	 * @param {ShaderNodeInternal} shaderNode - The shader node.
	 * @return {string} The WGSL function code.
	 */
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

	/**
	 * Contextually returns either the vertex stage instance index builtin
	 * or the linearized index of an compute invocation within a grid of workgroups.
	 *
	 * @return {string} The instance index.
	 */
	getInstanceIndex() {

		if ( this.shaderStage === 'vertex' ) {

			return this.getBuiltin( 'instance_index', 'instanceIndex', 'u32', 'attribute' );

		}

		return 'instanceIndex';

	}


	/**
	 * Returns a builtin representing the index of a compute invocation within the scope of a workgroup load.
	 *
	 * @return {string} The invocation local index.
	 */
	getInvocationLocalIndex() {

		return this.getBuiltin( 'local_invocation_index', 'invocationLocalIndex', 'u32', 'attribute' );

	}

	/**
	 * Returns a builtin representing the size of a subgroup within the current shader.
	 *
	 * @return {string} The subgroup size.
	 */
	getSubgroupSize() {

		this.enableSubGroups();

		return this.getBuiltin( 'subgroup_size', 'subgroupSize', 'u32', 'attribute' );

	}

	/**
	 * Returns a builtin representing the index of a compute invocation within the scope of a subgroup.
	 *
	 * @return {string} The invocation subgroup index.
	 */
	getInvocationSubgroupIndex() {

		this.enableSubGroups();

		return this.getBuiltin( 'subgroup_invocation_id', 'invocationSubgroupIndex', 'u32', 'attribute' );

	}

	/**
	 * Returns a builtin representing the index of a compute invocation's subgroup within its workgroup.
	 *
	 * @return {string} The subgroup index.
	 */
	getSubgroupIndex() {

		this.enableSubGroups();

		return this.getBuiltin( 'subgroup_id', 'subgroupIndex', 'u32', 'attribute' );

	}

	/**
	 * Overwritten as a NOP since this method is intended for the WebGL 2 backend.
	 *
	 * @return {null} Null.
	 */
	getDrawIndex() {

		return null;

	}

	/**
	 * Returns the front facing builtin.
	 *
	 * @return {string} The front facing builtin.
	 */
	getFrontFacing() {

		return this.getBuiltin( 'front_facing', 'isFront', 'bool' );

	}

	/**
	 * Returns the frag coord builtin.
	 *
	 * @return {string} The frag coord builtin.
	 */
	getFragCoord() {

		return this.getBuiltin( 'position', 'fragCoord', 'vec4<f32>' ) + '.xy';

	}

	/**
	 * Returns the frag depth builtin.
	 *
	 * @return {string} The frag depth builtin.
	 */
	getFragDepth() {

		return 'output.' + this.getBuiltin( 'frag_depth', 'depth', 'f32', 'output' );

	}

	/**
	 * Returns the clip distances builtin.
	 *
	 * @return {string} The clip distances builtin.
	 */
	getClipDistance() {

		return 'varyings.hw_clip_distances';

	}

	/**
	 * Whether to flip texture data along its vertical axis or not.
	 *
	 * @return {boolean} Returns always `false` in context of WGSL.
	 */
	isFlipY() {

		return false;

	}

	/**
	 * Enables the given directive for the given shader stage.
	 *
	 * @param {string} name - The directive name.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage to enable the directive for.
	 */
	enableDirective( name, shaderStage = this.shaderStage ) {

		const stage = this.directives[ shaderStage ] || ( this.directives[ shaderStage ] = new Set() );
		stage.add( name );

	}

	/**
	 * Returns the directives of the given shader stage as a WGSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} A WGSL snippet that enables the directives of the given stage.
	 */
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

	/**
	 * Enables the 'subgroups' directive.
	 */
	enableSubGroups() {

		this.enableDirective( 'subgroups' );

	}

	/**
	 * Enables the 'subgroups-f16' directive.
	 */
	enableSubgroupsF16() {

		this.enableDirective( 'subgroups-f16' );

	}

	/**
	 * Enables the 'clip_distances' directive.
	 */
	enableClipDistances() {

		this.enableDirective( 'clip_distances' );

	}

	/**
	 * Enables the 'f16' directive.
	 */
	enableShaderF16() {

		this.enableDirective( 'f16' );

	}

	/**
	 * Enables the 'dual_source_blending' directive.
	 */
	enableDualSourceBlending() {

		this.enableDirective( 'dual_source_blending' );

	}

	/**
	 * Enables hardware clipping.
	 *
	 * @param {string} planeCount - The clipping plane count.
	 */
	enableHardwareClipping( planeCount ) {

		this.enableClipDistances();
		this.getBuiltin( 'clip_distances', 'hw_clip_distances', `array<f32, ${ planeCount } >`, 'vertex' );

	}

	/**
	 * Returns the builtins of the given shader stage as a WGSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} A WGSL snippet that represents the builtins of the given stage.
	 */
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

	/**
	 * This method should be used when a new scoped buffer is used in context of
	 * compute shaders. It adds the array to the internal data structure which is
	 * later used to generate the respective WGSL.
	 *
	 * @param {string} name - The array name.
	 * @param {string} scope - The scope.
	 * @param {string} bufferType - The buffer type.
	 * @param {string} bufferCount - The buffer count.
	 * @return {string} The array name.
	 */
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

	/**
	 * Returns the scoped arrays of the given shader stage as a WGSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string|undefined} The WGSL snippet that defines the scoped arrays.
	 * Returns `undefined` when used in the vertex or fragment stage.
	 */
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

	/**
	 * Returns the shader attributes of the given shader stage as a WGSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The WGSL snippet that defines the shader attributes.
	 */
	getAttributes( shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'compute' ) {

			this.getBuiltin( 'global_invocation_id', 'globalId', 'vec3<u32>', 'attribute' );
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

	/**
	 * Returns the members of the given struct type node as a WGSL string.
	 *
	 * @param {StructTypeNode} struct - The struct type node.
	 * @return {string} The WGSL snippet that defines the struct members.
	 */
	getStructMembers( struct ) {

		const snippets = [];

		for ( const member of struct.members ) {

			const prefix = struct.output ? '@location( ' + member.index + ' ) ' : '';

			let type = this.getType( member.type );

			if ( member.atomic ) {

				type = 'atomic< ' + type + ' >';

			}

			snippets.push( `\t${ prefix + member.name } : ${ type }` );

		}

		if ( struct.output ) {

			snippets.push( `\t${ this.getBuiltins( 'output' ) }` );

		}

		return snippets.join( ',\n' );

	}

	/**
	 * Returns the structs of the given shader stage as a WGSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The WGSL snippet that defines the structs.
	 */
	getStructs( shaderStage ) {

		let result = '';

		const structs = this.structs[ shaderStage ];

		if ( structs.length > 0 ) {

			const snippets = [];

			for ( const struct of structs ) {

				let snippet = `struct ${ struct.name } {\n`;
				snippet += this.getStructMembers( struct );
				snippet += '\n};';

				snippets.push( snippet );

			}

			result = '\n' + snippets.join( '\n\n' ) + '\n';

		}

		return result;

	}

	/**
	 * Returns a WGSL string representing a variable.
	 *
	 * @param {string} type - The variable's type.
	 * @param {string} name - The variable's name.
	 * @param {?number} [count=null] - The array length.
	 * @return {string} The WGSL snippet that defines a variable.
	 */
	getVar( type, name, count = null ) {

		let snippet = `var ${ name } : `;

		if ( count !== null ) {

			snippet += this.generateArrayDeclaration( type, count );

		} else {

			snippet += this.getType( type );

		}

		return snippet;

	}

	/**
	 * Returns the variables of the given shader stage as a WGSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The WGSL snippet that defines the variables.
	 */
	getVars( shaderStage ) {

		const snippets = [];
		const vars = this.vars[ shaderStage ];

		if ( vars !== undefined ) {

			for ( const variable of vars ) {

				snippets.push( `\t${ this.getVar( variable.type, variable.name, variable.count ) };` );

			}

		}

		return `\n${ snippets.join( '\n' ) }\n`;

	}

	/**
	 * Returns the varyings of the given shader stage as a WGSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The WGSL snippet that defines the varyings.
	 */
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

					if ( varying.interpolationType ) {

						const samplingSnippet = varying.interpolationSampling !== null ? `, ${ varying.interpolationSampling } )` : ' )';

						attributesSnippet += ` @interpolate( ${ varying.interpolationType }${ samplingSnippet }`;

						// Otherwise, optimize interpolation when sensible

					} else if ( /^(int|uint|ivec|uvec)/.test( varying.type ) ) {

						attributesSnippet += ` @interpolate( ${ this.renderer.backend.compatibilityMode ? 'flat, either' : 'flat' } )`;

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

	isCustomStruct( nodeUniform ) {

		const attribute = nodeUniform.value;
		const bufferNode = nodeUniform.node;

		const isAttributeStructType = ( attribute.isBufferAttribute || attribute.isInstancedBufferAttribute ) && bufferNode.structTypeNode !== null;

		const isStructArray =
			( bufferNode.value && bufferNode.value.array ) &&
			( typeof bufferNode.value.itemSize === 'number' && bufferNode.value.array.length > bufferNode.value.itemSize );

		return isAttributeStructType && ! isStructArray;

	}

	/**
	 * Returns the uniforms of the given shader stage as a WGSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The WGSL snippet that defines the uniforms.
	 */
	getUniforms( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		const bindingSnippets = [];
		const bufferSnippets = [];
		const structSnippets = [];
		const uniformGroups = {};

		for ( const uniform of uniforms ) {

			const groupName = uniform.groupNode.name;
			const uniformIndexes = this.bindingsIndexes[ groupName ];

			if ( uniform.type === 'texture' || uniform.type === 'cubeTexture' || uniform.type === 'cubeDepthTexture' || uniform.type === 'storageTexture' || uniform.type === 'texture3D' ) {

				const texture = uniform.node.value;

				if ( this.isUnfilterable( texture ) === false && uniform.node.isStorageTextureNode !== true ) {

					if ( this.isSampleCompare( texture ) ) {

						bindingSnippets.push( `@binding( ${ uniformIndexes.binding ++ } ) @group( ${ uniformIndexes.group } ) var ${ uniform.name }_sampler : sampler_comparison;` );

					} else {

						bindingSnippets.push( `@binding( ${ uniformIndexes.binding ++ } ) @group( ${ uniformIndexes.group } ) var ${ uniform.name }_sampler : sampler;` );

					}

				}

				let textureType;

				let multisampled = '';

				const { primarySamples } = this.renderer.backend.utils.getTextureSampleData( texture );

				if ( primarySamples > 1 ) {

					multisampled = '_multisampled';

				}

				if ( texture.isCubeTexture === true && texture.isDepthTexture === true ) {

					textureType = 'texture_depth_cube';

				} else if ( texture.isCubeTexture === true ) {

					textureType = 'texture_cube<f32>';

				} else if ( texture.isDepthTexture === true ) {

					if ( this.renderer.backend.compatibilityMode && texture.compareFunction === null ) {

						textureType = `texture${ multisampled }_2d<f32>`;

					} else {

						textureType = `texture_depth${ multisampled }_2d${ texture.isArrayTexture === true ? '_array' : '' }`;

					}

				} else if ( uniform.node.isStorageTextureNode === true ) {

					const format = getFormat( texture );
					const access = this.getStorageAccess( uniform.node, shaderStage );

					const is3D = uniform.node.value.is3DTexture;
					const isArrayTexture = uniform.node.value.isArrayTexture;

					const dimension = is3D ? '3d' : `2d${ isArrayTexture ? '_array' : '' }`;

					textureType = `texture_storage_${ dimension }<${ format }, ${ access }>`;

				} else if ( texture.isArrayTexture === true || texture.isDataArrayTexture === true || texture.isCompressedArrayTexture === true ) {

					textureType = 'texture_2d_array<f32>';

				} else if ( texture.is3DTexture === true || texture.isData3DTexture === true ) {

					textureType = 'texture_3d<f32>';

				} else {

					const componentPrefix = this.getComponentTypeFromTexture( texture ).charAt( 0 );

					textureType = `texture${ multisampled }_2d<${ componentPrefix }32>`;

				}

				bindingSnippets.push( `@binding( ${ uniformIndexes.binding ++ } ) @group( ${ uniformIndexes.group } ) var ${ uniform.name } : ${ textureType };` );

			} else if ( uniform.type === 'buffer' || uniform.type === 'storageBuffer' || uniform.type === 'indirectStorageBuffer' ) {

				const bufferNode = uniform.node;
				const bufferType = this.getType( bufferNode.getNodeType( this ) );
				const bufferCount = bufferNode.bufferCount;
				const bufferCountSnippet = bufferCount > 0 && uniform.type === 'buffer' ? ', ' + bufferCount : '';
				const bufferAccessMode = bufferNode.isStorageBufferNode ? `storage, ${ this.getStorageAccess( bufferNode, shaderStage ) }` : 'uniform';

				if ( this.isCustomStruct( uniform ) ) {

					bufferSnippets.push( `@binding( ${ uniformIndexes.binding ++ } ) @group( ${ uniformIndexes.group } ) var<${ bufferAccessMode }> ${ uniform.name } : ${ bufferType };` );

				} else {

					const bufferTypeSnippet = bufferNode.isAtomic ? `atomic<${ bufferType }>` : `${ bufferType }`;
					const bufferSnippet = `\tvalue : array< ${ bufferTypeSnippet }${ bufferCountSnippet } >`;

					bufferSnippets.push( this._getWGSLStructBinding( uniform.name, bufferSnippet, bufferAccessMode, uniformIndexes.binding ++, uniformIndexes.group ) );

				}

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

		const code = [ ...bindingSnippets, ...bufferSnippets, ...structSnippets ].join( '\n' );

		return code;

	}

	/**
	 * Controls the code build of the shader stages.
	 */
	buildCode() {

		const shadersData = this.material !== null ? { fragment: {}, vertex: {} } : { compute: {} };

		this.sortBindingGroups();

		for ( const shaderStage in shadersData ) {

			this.shaderStage = shaderStage;

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

					flow += `\t// flow -> ${ slotName }\n`;

				}

				flow += `${ flowSlotData.code }\n\t`;

				if ( node === mainNode && shaderStage !== 'compute' ) {

					flow += '// result\n\n\t';

					if ( shaderStage === 'vertex' ) {

						flow += `varyings.Vertex = ${ flowSlotData.result };`;

					} else if ( shaderStage === 'fragment' ) {

						if ( isOutputStruct ) {

							stageData.returnType = outputNode.getNodeType( this );
							stageData.structs += 'var<private> output : ' + stageData.returnType + ';';

							flow += `return ${ flowSlotData.result };`;

						} else {

							let structSnippet = '\t@location(0) color: vec4<f32>';

							const builtins = this.getBuiltins( 'output' );

							if ( builtins ) structSnippet += ',\n\t' + builtins;

							stageData.returnType = 'OutputStruct';
							stageData.structs += this._getWGSLStruct( 'OutputStruct', structSnippet );
							stageData.structs += '\nvar<private> output : OutputStruct;';

							flow += `output.color = ${ flowSlotData.result };\n\n\treturn output;`;

						}

					}

				}

			}

			stageData.flow = flow;

		}

		this.shaderStage = null;

		if ( this.material !== null ) {

			this.vertexShader = this._getWGSLVertexCode( shadersData.vertex );
			this.fragmentShader = this._getWGSLFragmentCode( shadersData.fragment );

		} else {

			// Early strictly validated in computeNode

			const workgroupSize = this.object.workgroupSize;

			this.computeShader = this._getWGSLComputeCode( shadersData.compute, workgroupSize );

		}

	}

	/**
	 * Returns the native shader method name for a given generic name.
	 *
	 * @param {string} method - The method name to resolve.
	 * @param {?string} [output=null] - An optional output.
	 * @return {string} The resolved WGSL method name.
	 */
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

	/**
	 * Returns the bitcast method name for a given input and outputType.
	 *
	 * @param {string} type - The output type to bitcast to.
	 * @return {string} The resolved WGSL bitcast invocation.
	 */
	getBitcastMethod( type ) {

		const dataType = this.getType( type );

		return `bitcast<${ dataType }>`;

	}

	/**
	 * Returns the float packing method name for a given numeric encoding.
	 *
	 * @param {string} encoding - The numeric encoding that describes how the float values are mapped to the integer range.
	 * @returns {string} The resolve WGSL float packing method name.
	 */
	getFloatPackingMethod( encoding ) {

		return this.getMethod( `floatpack_${ encoding }_2x16` );

	}

	/**
	 * Returns the float unpacking method name for a given numeric encoding.
	 *
	 * @param {string} encoding - The numeric encoding that describes how the integer values are mapped to the float range.
	 * @returns {string} The resolve WGSL float unpacking method name.
	 */
	getFloatUnpackingMethod( encoding ) {

		return this.getMethod( `floatunpack_${ encoding }_2x16` );

	}

	/**
	 * Returns the native snippet for a ternary operation.
	 *
	 * @param {string} condSnippet - The condition determining which expression gets resolved.
	 * @param {string} ifSnippet - The expression to resolve to if the condition is true.
	 * @param {string} elseSnippet - The expression to resolve to if the condition is false.
	 * @return {string} The resolved method name.
	 */
	getTernary( condSnippet, ifSnippet, elseSnippet ) {

		return `select( ${elseSnippet}, ${ifSnippet}, ${condSnippet} )`;

	}


	/**
	 * Returns the WGSL type of the given node data type.
	 *
	 * @param {string} type - The node data type.
	 * @return {string} The WGSL type.
	 */
	getType( type ) {

		return wgslTypeLib[ type ] || type;

	}

	/**
	 * Whether the requested feature is available or not.
	 *
	 * @param {string} name - The requested feature.
	 * @return {boolean} Whether the requested feature is supported or not.
	 */
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

	/**
	 * Returns the native shader method name for a given generic name.
	 *
	 * @private
	 * @param {string} method - The method name to resolve.
	 * @return {string} The resolved WGSL method name.
	 */
	_getWGSLMethod( method ) {

		if ( wgslPolyfill[ method ] !== undefined ) {

			this._include( method );

		}

		return wgslMethods[ method ];

	}

	/**
	 * Includes the given method name into the current
	 * function node.
	 *
	 * @private
	 * @param {string} name - The method name to include.
	 * @return {CodeNode} The respective code node.
	 */
	_include( name ) {

		const codeNode = wgslPolyfill[ name ];
		codeNode.build( this );

		this.addInclude( codeNode );

		return codeNode;

	}

	/**
	 * Returns a WGSL vertex shader based on the given shader data.
	 *
	 * @private
	 * @param {Object} shaderData - The shader data.
	 * @return {string} The vertex shader.
	 */
	_getWGSLVertexCode( shaderData ) {

		return `${ this.getSignature() }
// directives
${shaderData.directives}

// structs
${shaderData.structs}

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

	/**
	 * Returns a WGSL fragment shader based on the given shader data.
	 *
	 * @private
	 * @param {Object} shaderData - The shader data.
	 * @return {string} The vertex shader.
	 */
	_getWGSLFragmentCode( shaderData ) {

		return `${ this.getSignature() }
// global
${ diagnostics }

// structs
${shaderData.structs}

// uniforms
${shaderData.uniforms}

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

	/**
	 * Returns a WGSL compute shader based on the given shader data.
	 *
	 * @private
	 * @param {Object} shaderData - The shader data.
	 * @param {string} workgroupSize - The workgroup size.
	 * @return {string} The vertex shader.
	 */
	_getWGSLComputeCode( shaderData, workgroupSize ) {

		const [ workgroupSizeX, workgroupSizeY, workgroupSizeZ ] = workgroupSize;

		return `${ this.getSignature() }
// directives
${ shaderData.directives }

// system
var<private> instanceIndex : u32;

// locals
${ shaderData.scopedArrays }

// structs
${ shaderData.structs }

// uniforms
${ shaderData.uniforms }

// codes
${ shaderData.codes }

@compute @workgroup_size( ${ workgroupSizeX }, ${ workgroupSizeY }, ${ workgroupSizeZ } )
fn main( ${ shaderData.attributes } ) {

	// system
	instanceIndex = globalId.x
		+ globalId.y * ( ${ workgroupSizeX } * numWorkgroups.x )
		+ globalId.z * ( ${ workgroupSizeX } * numWorkgroups.x ) * ( ${ workgroupSizeY } * numWorkgroups.y );

	// vars
	${ shaderData.vars }

	// flow
	${ shaderData.flow }

}
`;

	}

	/**
	 * Returns a WGSL struct based on the given name and variables.
	 *
	 * @private
	 * @param {string} name - The struct name.
	 * @param {string} vars - The struct variables.
	 * @return {string} The WGSL snippet representing a struct.
	 */
	_getWGSLStruct( name, vars ) {

		return `
struct ${name} {
${vars}
};`;

	}

	/**
	 * Returns a WGSL struct binding.
	 *
	 * @private
	 * @param {string} name - The struct name.
	 * @param {string} vars - The struct variables.
	 * @param {string} access - The access.
	 * @param {number} [binding=0] - The binding index.
	 * @param {number} [group=0] - The group index.
	 * @return {string} The WGSL snippet representing a struct binding.
	 */
	_getWGSLStructBinding( name, vars, access, binding = 0, group = 0 ) {

		const structName = name + 'Struct';
		const structSnippet = this._getWGSLStruct( structName, vars );

		return `${structSnippet}
@binding( ${ binding } ) @group( ${ group } )
var<${access}> ${ name } : ${ structName };`;

	}

}

export default WGSLNodeBuilder;
