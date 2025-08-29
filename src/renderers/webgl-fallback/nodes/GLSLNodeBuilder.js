import { GLSLNodeParser, NodeBuilder, TextureNode, vectorComponents } from '../../../nodes/Nodes.js';

import NodeUniformBuffer from '../../common/nodes/NodeUniformBuffer.js';
import NodeUniformsGroup from '../../common/nodes/NodeUniformsGroup.js';

import { NodeSampledTexture, NodeSampledCubeTexture, NodeSampledTexture3D } from '../../common/nodes/NodeSampledTexture.js';

import { NoColorSpace, ByteType, ShortType, RGBAIntegerFormat, RGBIntegerFormat, RedIntegerFormat, RGIntegerFormat, UnsignedByteType, UnsignedIntType, UnsignedShortType, RedFormat, RGFormat, IntType, RGBFormat, RGBAFormat, FloatType } from '../../../constants.js';
import { DataTexture } from '../../../textures/DataTexture.js';

const glslMethods = {
	textureDimensions: 'textureSize',
	equals: 'equal',
	bitcast_float_int: 'floatBitsToInt',
	bitcast_int_float: 'intBitsToFloat',
	bitcast_uint_float: 'uintBitsToFloat',
	bitcast_float_uint: 'floatBitsToUint',
};

const precisionLib = {
	low: 'lowp',
	medium: 'mediump',
	high: 'highp'
};

const supports = {
	swizzleAssign: true,
	storageBuffer: false
};

const interpolationTypeMap = {
	perspective: 'smooth',
	linear: 'noperspective'
};

const interpolationModeMap = {
	'centroid': 'centroid'
};

const defaultPrecisions = `
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler3D;
precision highp samplerCube;
precision highp sampler2DArray;

precision highp usampler2D;
precision highp usampler3D;
precision highp usamplerCube;
precision highp usampler2DArray;

precision highp isampler2D;
precision highp isampler3D;
precision highp isamplerCube;
precision highp isampler2DArray;

precision lowp sampler2DShadow;
precision lowp sampler2DArrayShadow;
precision lowp samplerCubeShadow;
`;

/**
 * A node builder targeting GLSL.
 *
 * This module generates GLSL shader code from node materials and also
 * generates the respective bindings and vertex buffer definitions. These
 * data are later used by the renderer to create render and compute pipelines
 * for render objects.
 *
 * @augments NodeBuilder
 */
class GLSLNodeBuilder extends NodeBuilder {

	/**
	 * Constructs a new GLSL node builder renderer.
	 *
	 * @param {Object3D} object - The 3D object.
	 * @param {Renderer} renderer - The renderer.
	 */
	constructor( object, renderer ) {

		super( object, renderer, new GLSLNodeParser() );

		/**
		 * A dictionary holds for each shader stage ('vertex', 'fragment', 'compute')
		 * another dictionary which manages UBOs per group ('render','frame','object').
		 *
		 * @type {Object<string,Object<string,NodeUniformsGroup>>}
		 */
		this.uniformGroups = {};

		/**
		 * An array that holds objects defining the varying and attribute data in
		 * context of Transform Feedback.
		 *
		 * @type {Array<Object<string,AttributeNode|string>>}
		 */
		this.transforms = [];

		/**
		 * A dictionary that holds for each shader stage a Map of used extensions.
		 *
		 * @type {Object<string,Map<string,Object>>}
		 */
		this.extensions = {};

		/**
		 * A dictionary that holds for each shader stage an Array of used builtins.
		 *
		 * @type {Object<string,Array<string>>}
		 */
		this.builtins = { vertex: [], fragment: [], compute: [] };

	}

	/**
	 * Checks if the given texture requires a manual conversion to the working color space.
	 *
	 * @param {Texture} texture - The texture to check.
	 * @return {boolean} Whether the given texture requires a conversion to working color space or not.
	 */
	needsToWorkingColorSpace( texture ) {

		return texture.isVideoTexture === true && texture.colorSpace !== NoColorSpace;

	}

	/**
	 * Returns the native shader method name for a given generic name.
	 *
	 * @param {string} method - The method name to resolve.
	 * @return {string} The resolved GLSL method name.
	 */
	getMethod( method ) {

		return glslMethods[ method ] || method;

	}

	/**
	 * Returns the bitcast method name for a given input and outputType.
	 *
	 * @param {string} type - The output type to bitcast to.
	 * @param {string} inputType - The input type of the.
	 * @return {string} The resolved WGSL bitcast invocation.
	 */
	getBitcastMethod( type, inputType ) {

		return glslMethods[ `bitcast_${ inputType }_${ type }` ];

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

		return `${condSnippet} ? ${ifSnippet} : ${elseSnippet}`;

	}

	/**
	 * Returns the output struct name. Not relevant for GLSL.
	 *
	 * @return {string}
	 */
	getOutputStructName() {

		return '';

	}

	/**
	 * Builds the given shader node.
	 *
	 * @param {ShaderNodeInternal} shaderNode - The shader node.
	 * @return {string} The GLSL function code.
	 */
	buildFunctionCode( shaderNode ) {

		const layout = shaderNode.layout;
		const flowData = this.flowShaderNode( shaderNode );

		const parameters = [];

		for ( const input of layout.inputs ) {

			parameters.push( this.getType( input.type ) + ' ' + input.name );

		}

		//

		const code = `${ this.getType( layout.type ) } ${ layout.name }( ${ parameters.join( ', ' ) } ) {

	${ flowData.vars }

${ flowData.code }
	return ${ flowData.result };

}`;

		//

		return code;

	}

	/**
	 * Setups the Pixel Buffer Object (PBO) for the given storage
	 * buffer node.
	 *
	 * @param {StorageBufferNode} storageBufferNode - The storage buffer node.
	 */
	setupPBO( storageBufferNode ) {

		const attribute = storageBufferNode.value;

		if ( attribute.pbo === undefined ) {

			const originalArray = attribute.array;
			const numElements = attribute.count * attribute.itemSize;

			const { itemSize } = attribute;

			const isInteger = attribute.array.constructor.name.toLowerCase().includes( 'int' );

			let format = isInteger ? RedIntegerFormat : RedFormat;

			if ( itemSize === 2 ) {

				format = isInteger ? RGIntegerFormat : RGFormat;

			} else if ( itemSize === 3 ) {

				format = isInteger ? RGBIntegerFormat : RGBFormat;

			} else if ( itemSize === 4 ) {

				format = isInteger ? RGBAIntegerFormat : RGBAFormat;

			}

			const typeMap = {
				Float32Array: FloatType,
				Uint8Array: UnsignedByteType,
				Uint16Array: UnsignedShortType,
				Uint32Array: UnsignedIntType,
				Int8Array: ByteType,
				Int16Array: ShortType,
				Int32Array: IntType,
				Uint8ClampedArray: UnsignedByteType,
			};

			const width = Math.pow( 2, Math.ceil( Math.log2( Math.sqrt( numElements / itemSize ) ) ) );
			let height = Math.ceil( ( numElements / itemSize ) / width );
			if ( width * height * itemSize < numElements ) height ++; // Ensure enough space

			const newSize = width * height * itemSize;

			const newArray = new originalArray.constructor( newSize );

			newArray.set( originalArray, 0 );

			attribute.array = newArray;

			const pboTexture = new DataTexture( attribute.array, width, height, format, typeMap[ attribute.array.constructor.name ] || FloatType );
			pboTexture.needsUpdate = true;
			pboTexture.isPBOTexture = true;

			const pbo = new TextureNode( pboTexture, null, null );
			pbo.setPrecision( 'high' );

			attribute.pboNode = pbo;
			attribute.pbo = pbo.value;

			this.getUniformFromNode( attribute.pboNode, 'texture', this.shaderStage, this.context.nodeName );

		}

	}

	/**
	 * Returns a GLSL snippet that represents the property name of the given node.
	 *
	 * @param {Node} node - The node.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage this code snippet is generated for.
	 * @return {string} The property name.
	 */
	getPropertyName( node, shaderStage = this.shaderStage ) {

		if ( node.isNodeUniform && node.node.isTextureNode !== true && node.node.isBufferNode !== true ) {

			return shaderStage.charAt( 0 ) + '_' + node.name;

		}

		return super.getPropertyName( node, shaderStage );

	}

	/**
	 * Setups the Pixel Buffer Object (PBO) for the given storage
	 * buffer node.
	 *
	 * @param {StorageArrayElementNode} storageArrayElementNode - The storage array element node.
	 * @return {string} The property name.
	 */
	generatePBO( storageArrayElementNode ) {

		const { node, indexNode } = storageArrayElementNode;
		const attribute = node.value;

		if ( this.renderer.backend.has( attribute ) ) {

			const attributeData = this.renderer.backend.get( attribute );
			attributeData.pbo = attribute.pbo;

		}

		const nodeUniform = this.getUniformFromNode( attribute.pboNode, 'texture', this.shaderStage, this.context.nodeName );
		const textureName = this.getPropertyName( nodeUniform );

		this.increaseUsage( indexNode ); // force cache generate to be used as index in x,y
		const indexSnippet = indexNode.build( this, 'uint' );

		const elementNodeData = this.getDataFromNode( storageArrayElementNode );

		let propertyName = elementNodeData.propertyName;

		if ( propertyName === undefined ) {

			// property element

			const nodeVar = this.getVarFromNode( storageArrayElementNode );

			propertyName = this.getPropertyName( nodeVar );

			// property size

			const bufferNodeData = this.getDataFromNode( node );

			let propertySizeName = bufferNodeData.propertySizeName;

			if ( propertySizeName === undefined ) {

				propertySizeName = propertyName + 'Size';

				this.getVarFromNode( node, propertySizeName, 'uint' );

				this.addLineFlowCode( `${ propertySizeName } = uint( textureSize( ${ textureName }, 0 ).x )`, storageArrayElementNode );

				bufferNodeData.propertySizeName = propertySizeName;

			}

			//

			const { itemSize } = attribute;

			const channel = '.' + vectorComponents.join( '' ).slice( 0, itemSize );
			const uvSnippet = `ivec2(${indexSnippet} % ${ propertySizeName }, ${indexSnippet} / ${ propertySizeName })`;

			const snippet = this.generateTextureLoad( null, textureName, uvSnippet, null, null, '0' );

			//


			let prefix = 'vec4';

			if ( attribute.pbo.type === UnsignedIntType ) {

				prefix = 'uvec4';

			} else if ( attribute.pbo.type === IntType ) {

				prefix = 'ivec4';

			}

			this.addLineFlowCode( `${ propertyName } = ${prefix}(${ snippet })${channel}`, storageArrayElementNode );

			elementNodeData.propertyName = propertyName;

		}

		return propertyName;

	}

	/**
	 * Generates the GLSL snippet that reads a single texel from a texture without sampling or filtering.
	 *
	 * @param {?Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvIndexSnippet - A GLSL snippet that represents texture coordinates used for sampling.
	 * @param {?string} depthSnippet - A GLSL snippet that represents the 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @param {string} [levelSnippet='0u'] - A GLSL snippet that represents the mip level, with level 0 containing a full size version of the texture.
	 * @return {string} The GLSL snippet.
	 */
	generateTextureLoad( texture, textureProperty, uvIndexSnippet, depthSnippet, offsetSnippet, levelSnippet = '0' ) {

		let snippet;

		if ( depthSnippet ) {

			if ( offsetSnippet ) {

				snippet = `texelFetchOffset( ${ textureProperty }, ivec3( ${ uvIndexSnippet }, ${ depthSnippet } ), ${ levelSnippet }, ${ offsetSnippet } )`;

			} else {

				snippet = `texelFetch( ${ textureProperty }, ivec3( ${ uvIndexSnippet }, ${ depthSnippet } ), ${ levelSnippet } )`;

			}

		} else {

			if ( offsetSnippet ) {

				snippet = `texelFetchOffset( ${ textureProperty }, ${ uvIndexSnippet }, ${ levelSnippet }, ${ offsetSnippet } )`;

			} else {

				snippet = `texelFetch( ${ textureProperty }, ${ uvIndexSnippet }, ${ levelSnippet } )`;

			}

		}

		if ( texture !== null && texture.isDepthTexture ) {

			snippet += '.x';

		}

		return snippet;

	}

	/**
	 * Generates the GLSL snippet for sampling/loading the given texture.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A GLSL snippet that represents texture coordinates used for sampling.
	 * @param {?string} depthSnippet -  A GLSL snippet that represents the 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @return {string} The GLSL snippet.
	 */
	generateTexture( texture, textureProperty, uvSnippet, depthSnippet, offsetSnippet ) {

		if ( depthSnippet ) uvSnippet = `vec3( ${ uvSnippet }, ${ depthSnippet } )`;

		if ( texture.isDepthTexture ) {

			if ( offsetSnippet ) return `textureOffset( ${ textureProperty }, ${ uvSnippet }, ${ offsetSnippet } ).x`;

			return `texture( ${ textureProperty }, ${ uvSnippet } ).x`;

		}

		if ( offsetSnippet ) return `textureOffset( ${ textureProperty }, ${ uvSnippet }, ${ offsetSnippet } )`;

		return `texture( ${ textureProperty }, ${ uvSnippet } )`;

	}

	/**
	 * Generates the GLSL snippet when sampling textures with explicit mip level.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A GLSL snippet that represents texture coordinates used for sampling.
	 * @param {string} levelSnippet - A GLSL snippet that represents the mip level, with level 0 containing a full size version of the texture.
	 * @param {?string} offsetSnippet - A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @return {string} The GLSL snippet.
	 */
	generateTextureLevel( texture, textureProperty, uvSnippet, levelSnippet, offsetSnippet ) {

		if ( offsetSnippet ) {

			return `textureLodOffset( ${ textureProperty }, ${ uvSnippet }, ${ levelSnippet }, ${ offsetSnippet } )`;

		}

		return `textureLod( ${ textureProperty }, ${ uvSnippet }, ${ levelSnippet } )`;

	}

	/**
	 * Generates the GLSL snippet when sampling textures with a bias to the mip level.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A GLSL snippet that represents texture coordinates used for sampling.
	 * @param {string} biasSnippet - A GLSL snippet that represents the bias to apply to the mip level before sampling.
	 * @param {?string} offsetSnippet - A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @return {string} The GLSL snippet.
	 */
	generateTextureBias( texture, textureProperty, uvSnippet, biasSnippet, offsetSnippet ) {

		if ( offsetSnippet ) {

			return `textureOffset( ${ textureProperty }, ${ uvSnippet }, ${ offsetSnippet }, ${ biasSnippet } )`;

		}

		return `texture( ${ textureProperty }, ${ uvSnippet }, ${ biasSnippet } )`;

	}

	/**
	 * Generates the GLSL snippet for sampling/loading the given texture using explicit gradients.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A GLSL snippet that represents texture coordinates used for sampling.
	 * @param {Array<string>} gradSnippet - An array holding both gradient GLSL snippets.
	 * @param {?string} offsetSnippet - A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @return {string} The GLSL snippet.
	 */
	generateTextureGrad( texture, textureProperty, uvSnippet, gradSnippet, offsetSnippet ) {

		if ( offsetSnippet ) {

			return `textureGradOffset( ${ textureProperty }, ${ uvSnippet }, ${ gradSnippet[ 0 ] }, ${ gradSnippet[ 1 ] }, ${ offsetSnippet } )`;

		}

		return `textureGrad( ${ textureProperty }, ${ uvSnippet }, ${ gradSnippet[ 0 ] }, ${ gradSnippet[ 1 ] } )`;

	}

	/**
	 * Generates the GLSL snippet for sampling a depth texture and comparing the sampled depth values
	 * against a reference value.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {string} textureProperty - The name of the texture uniform in the shader.
	 * @param {string} uvSnippet - A GLSL snippet that represents texture coordinates used for sampling.
	 * @param {string} compareSnippet -  A GLSL snippet that represents the reference value.
	 * @param {?string} depthSnippet - A GLSL snippet that represents 0-based texture array index to sample.
	 * @param {?string} offsetSnippet - A GLSL snippet that represents the offset that will be applied to the unnormalized texture coordinate before sampling the texture.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage this code snippet is generated for.
	 * @return {string} The GLSL snippet.
	 */
	generateTextureCompare( texture, textureProperty, uvSnippet, compareSnippet, depthSnippet, offsetSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			if ( depthSnippet ) {

				if ( offsetSnippet ) {

					return `textureOffset( ${ textureProperty }, vec4( ${ uvSnippet }, ${ depthSnippet }, ${ compareSnippet } ), ${ offsetSnippet } )`;

				}

				return `texture( ${ textureProperty }, vec4( ${ uvSnippet }, ${ depthSnippet }, ${ compareSnippet } ) )`;

			}

			if ( offsetSnippet ) {

				return `textureOffset( ${ textureProperty }, vec3( ${ uvSnippet }, ${ compareSnippet } ), ${ offsetSnippet } )`;

			}

			return `texture( ${ textureProperty }, vec3( ${ uvSnippet }, ${ compareSnippet } ) )`;

		} else {

			console.error( `WebGPURenderer: THREE.DepthTexture.compareFunction() does not support ${ shaderStage } shader.` );

		}

	}

	/**
	 * Returns the variables of the given shader stage as a GLSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The GLSL snippet that defines the variables.
	 */
	getVars( shaderStage ) {

		const snippets = [];

		const vars = this.vars[ shaderStage ];

		if ( vars !== undefined ) {

			for ( const variable of vars ) {

				snippets.push( `${ this.getVar( variable.type, variable.name, variable.count ) };` );

			}

		}

		return snippets.join( '\n\t' );

	}

	/**
	 * Returns the uniforms of the given shader stage as a GLSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The GLSL snippet that defines the uniforms.
	 */
	getUniforms( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		const bindingSnippets = [];
		const uniformGroups = {};

		for ( const uniform of uniforms ) {

			let snippet = null;
			let group = false;

			if ( uniform.type === 'texture' || uniform.type === 'texture3D' ) {

				const texture = uniform.node.value;

				let typePrefix = '';

				if ( texture.isDataTexture === true || texture.isData3DTexture === true ) {

					if ( texture.type === UnsignedIntType ) {

						typePrefix = 'u';

					} else if ( texture.type === IntType ) {

						typePrefix = 'i';

					}

				}

				if ( uniform.type === 'texture3D' && texture.isArrayTexture === false ) {

					snippet = `${typePrefix}sampler3D ${ uniform.name };`;

				} else if ( texture.compareFunction ) {

					if ( texture.isArrayTexture === true ) {

						snippet = `sampler2DArrayShadow ${ uniform.name };`;

					} else {

						snippet = `sampler2DShadow ${ uniform.name };`;

					}

				} else if ( texture.isArrayTexture === true || texture.isDataArrayTexture === true || texture.isCompressedArrayTexture === true ) {

					snippet = `${typePrefix}sampler2DArray ${ uniform.name };`;

				} else {

					snippet = `${typePrefix}sampler2D ${ uniform.name };`;

				}

			} else if ( uniform.type === 'cubeTexture' ) {

				snippet = `samplerCube ${ uniform.name };`;

			} else if ( uniform.type === 'buffer' ) {

				const bufferNode = uniform.node;
				const bufferType = this.getType( bufferNode.bufferType );
				const bufferCount = bufferNode.bufferCount;

				const bufferCountSnippet = bufferCount > 0 ? bufferCount : '';
				snippet = `${bufferNode.name} {\n\t${ bufferType } ${ uniform.name }[${ bufferCountSnippet }];\n};\n`;

			} else {

				const vectorType = this.getVectorType( uniform.type );

				snippet = `${ vectorType } ${ this.getPropertyName( uniform, shaderStage ) };`;

				group = true;

			}

			const precision = uniform.node.precision;

			if ( precision !== null ) {

				snippet = precisionLib[ precision ] + ' ' + snippet;

			}

			if ( group ) {

				snippet = '\t' + snippet;

				const groupName = uniform.groupNode.name;
				const groupSnippets = uniformGroups[ groupName ] || ( uniformGroups[ groupName ] = [] );

				groupSnippets.push( snippet );

			} else {

				snippet = 'uniform ' + snippet;

				bindingSnippets.push( snippet );

			}

		}

		let output = '';

		for ( const name in uniformGroups ) {

			const groupSnippets = uniformGroups[ name ];

			output += this._getGLSLUniformStruct( shaderStage + '_' + name, groupSnippets.join( '\n' ) ) + '\n';

		}

		output += bindingSnippets.join( '\n' );

		return output;

	}

	/**
	 * Returns the type for a given buffer attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 * @return {string} The type.
	 */
	getTypeFromAttribute( attribute ) {

		let nodeType = super.getTypeFromAttribute( attribute );

		if ( /^[iu]/.test( nodeType ) && attribute.gpuType !== IntType ) {

			let dataAttribute = attribute;

			if ( attribute.isInterleavedBufferAttribute ) dataAttribute = attribute.data;

			const array = dataAttribute.array;

			if ( ( array instanceof Uint32Array || array instanceof Int32Array ) === false ) {

				nodeType = nodeType.slice( 1 );

			}

		}

		return nodeType;

	}

	/**
	 * Returns the shader attributes of the given shader stage as a GLSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The GLSL snippet that defines the shader attributes.
	 */
	getAttributes( shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' || shaderStage === 'compute' ) {

			const attributes = this.getAttributesArray();

			let location = 0;

			for ( const attribute of attributes ) {

				snippet += `layout( location = ${ location ++ } ) in ${ attribute.type } ${ attribute.name };\n`;

			}

		}

		return snippet;

	}

	/**
	 * Returns the members of the given struct type node as a GLSL string.
	 *
	 * @param {StructTypeNode} struct - The struct type node.
	 * @return {string} The GLSL snippet that defines the struct members.
	 */
	getStructMembers( struct ) {

		const snippets = [];

		for ( const member of struct.members ) {

			snippets.push( `\t${ member.type } ${ member.name };` );

		}

		return snippets.join( '\n' );

	}

	/**
	 * Returns the structs of the given shader stage as a GLSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The GLSL snippet that defines the structs.
	 */
	getStructs( shaderStage ) {

		const snippets = [];
		const structs = this.structs[ shaderStage ];

		const outputSnippet = [];

		for ( const struct of structs ) {

			if ( struct.output ) {

				for ( const member of struct.members ) {

					outputSnippet.push( `layout( location = ${ member.index } ) out ${ member.type } ${ member.name };` );

				}

			} else {

				let snippet = 'struct ' + struct.name + ' {\n';
				snippet += this.getStructMembers( struct );
				snippet += '\n};\n';

				snippets.push( snippet );

			}

		}

		if ( outputSnippet.length === 0 ) {

			outputSnippet.push( 'layout( location = 0 ) out vec4 fragColor;' );

		}

		return '\n' + outputSnippet.join( '\n' ) + '\n\n' + snippets.join( '\n' );

	}

	/**
	 * Returns the varyings of the given shader stage as a GLSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The GLSL snippet that defines the varyings.
	 */
	getVaryings( shaderStage ) {

		let snippet = '';

		const varyings = this.varyings;

		if ( shaderStage === 'vertex' || shaderStage === 'compute' ) {

			for ( const varying of varyings ) {

				if ( shaderStage === 'compute' ) varying.needsInterpolation = true;

				const type = this.getType( varying.type );

				if ( varying.needsInterpolation ) {

					if ( varying.interpolationType ) {

						const interpolationType = interpolationTypeMap[ varying.interpolationType ] || varying.interpolationType;
						const sampling = interpolationModeMap[ varying.interpolationSampling ] || '';

						snippet += `${ interpolationType } ${ sampling } out ${ type } ${ varying.name };\n`;

					} else {

						const flat = type.includes( 'int' ) || type.includes( 'uv' ) || type.includes( 'iv' ) ? 'flat ' : '';

						snippet += `${ flat }out ${ type } ${ varying.name };\n`;

					}

				} else {

					snippet += `${type} ${varying.name};\n`; // generate variable (no varying required)

				}

			}

		} else if ( shaderStage === 'fragment' ) {

			for ( const varying of varyings ) {

				if ( varying.needsInterpolation ) {

					const type = this.getType( varying.type );

					if ( varying.interpolationType ) {

						const interpolationType = interpolationTypeMap[ varying.interpolationType ] || varying.interpolationType;
						const sampling = interpolationModeMap[ varying.interpolationSampling ] || '';

						snippet += `${ interpolationType } ${ sampling } in ${ type } ${ varying.name };\n`;


					} else {

						const flat = type.includes( 'int' ) || type.includes( 'uv' ) || type.includes( 'iv' ) ? 'flat ' : '';

						snippet += `${ flat }in ${ type } ${ varying.name };\n`;

					}

				}

			}

		}

		for ( const builtin of this.builtins[ shaderStage ] ) {

			snippet += `${builtin};\n`;

		}

		return snippet;

	}

	/**
	 * Returns the vertex index builtin.
	 *
	 * @return {string} The vertex index.
	 */
	getVertexIndex() {

		return 'uint( gl_VertexID )';

	}

	/**
	 * Returns the instance index builtin.
	 *
	 * @return {string} The instance index.
	 */
	getInstanceIndex() {

		return 'uint( gl_InstanceID )';

	}

	/**
	 * Returns the invocation local index builtin.
	 *
	 * @return {string} The invocation local index.
	 */
	getInvocationLocalIndex() {

		const workgroupSize = this.object.workgroupSize;

		const size = workgroupSize.reduce( ( acc, curr ) => acc * curr, 1 );

		return `uint( gl_InstanceID ) % ${size}u`;

	}

	/**
	 * Returns the draw index builtin.
	 *
	 * @return {?string} The drawIndex shader string. Returns `null` if `WEBGL_multi_draw` isn't supported by the device.
	 */
	getDrawIndex() {

		const extensions = this.renderer.backend.extensions;

		if ( extensions.has( 'WEBGL_multi_draw' ) ) {

			return 'uint( gl_DrawID )';

		}

		return null;

	}

	/**
	 * Returns the front facing builtin.
	 *
	 * @return {string} The front facing builtin.
	 */
	getFrontFacing() {

		return 'gl_FrontFacing';

	}

	/**
	 * Returns the frag coord builtin.
	 *
	 * @return {string} The frag coord builtin.
	 */
	getFragCoord() {

		return 'gl_FragCoord.xy';

	}

	/**
	 * Returns the frag depth builtin.
	 *
	 * @return {string} The frag depth builtin.
	 */
	getFragDepth() {

		return 'gl_FragDepth';

	}

	/**
	 * Enables the given extension.
	 *
	 * @param {string} name - The extension name.
	 * @param {string} behavior - The extension behavior.
	 * @param {string} [shaderStage=this.shaderStage] - The shader stage.
	 */
	enableExtension( name, behavior, shaderStage = this.shaderStage ) {

		const map = this.extensions[ shaderStage ] || ( this.extensions[ shaderStage ] = new Map() );

		if ( map.has( name ) === false ) {

			map.set( name, {
				name,
				behavior
			} );

		}

	}

	/**
	 * Returns the enabled extensions of the given shader stage as a GLSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The GLSL snippet that defines the enabled extensions.
	 */
	getExtensions( shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'vertex' ) {

			const ext = this.renderer.backend.extensions;
			const isBatchedMesh = this.object.isBatchedMesh;

			if ( isBatchedMesh && ext.has( 'WEBGL_multi_draw' ) ) {

				this.enableExtension( 'GL_ANGLE_multi_draw', 'require', shaderStage );

			}

		}

		const extensions = this.extensions[ shaderStage ];

		if ( extensions !== undefined ) {

			for ( const { name, behavior } of extensions.values() ) {

				snippets.push( `#extension ${name} : ${behavior}` );

			}

		}

		return snippets.join( '\n' );

	}

	/**
	 * Returns the clip distances builtin.
	 *
	 * @return {string} The clip distances builtin.
	 */
	getClipDistance() {

		return 'gl_ClipDistance';

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

			let extensionName;

			result = false;

			switch ( name ) {

				case 'float32Filterable':
					extensionName = 'OES_texture_float_linear';
					break;

				case 'clipDistance':
					extensionName = 'WEBGL_clip_cull_distance';
					break;

			}

			if ( extensionName !== undefined ) {

				const extensions = this.renderer.backend.extensions;

				if ( extensions.has( extensionName ) ) {

					extensions.get( extensionName );
					result = true;

				}

			}

			supports[ name ] = result;

		}

		return result;

	}

	/**
	 * Whether to flip texture data along its vertical axis or not.
	 *
	 * @return {boolean} Returns always `true` in context of GLSL.
	 */
	isFlipY() {

		return true;

	}

	/**
	 * Enables hardware clipping.
	 *
	 * @param {string} planeCount - The clipping plane count.
	 */
	enableHardwareClipping( planeCount ) {

		this.enableExtension( 'GL_ANGLE_clip_cull_distance', 'require' );

		this.builtins[ 'vertex' ].push( `out float gl_ClipDistance[ ${ planeCount } ]` );

	}

	/**
	 * Enables multiview.
	 */
	enableMultiview() {

		this.enableExtension( 'GL_OVR_multiview2', 'require', 'fragment' );
		this.enableExtension( 'GL_OVR_multiview2', 'require', 'vertex' );

		this.builtins[ 'vertex' ].push( 'layout(num_views = 2) in' );

	}

	/**
	 * Registers a transform in context of Transform Feedback.
	 *
	 * @param {string} varyingName - The varying name.
	 * @param {AttributeNode} attributeNode - The attribute node.
	 */
	registerTransform( varyingName, attributeNode ) {

		this.transforms.push( { varyingName, attributeNode } );

	}

	/**
	 * Returns the transforms of the given shader stage as a GLSL string.
	 *
	 * @param {string} shaderStage - The shader stage.
	 * @return {string} The GLSL snippet that defines the transforms.
	 */
	getTransforms( /* shaderStage  */ ) {

		const transforms = this.transforms;

		let snippet = '';

		for ( let i = 0; i < transforms.length; i ++ ) {

			const transform = transforms[ i ];
			const attributeName = this.getPropertyName( transform.attributeNode );

			if ( attributeName ) snippet += `${ transform.varyingName } = ${ attributeName };\n\t`;

		}

		return snippet;

	}

	/**
	 * Returns a GLSL struct based on the given name and variables.
	 *
	 * @private
	 * @param {string} name - The struct name.
	 * @param {string} vars - The struct variables.
	 * @return {string} The GLSL snippet representing a struct.
	 */
	_getGLSLUniformStruct( name, vars ) {

		return `
layout( std140 ) uniform ${name} {
${vars}
};`;

	}

	/**
	 * Returns a GLSL vertex shader based on the given shader data.
	 *
	 * @private
	 * @param {Object} shaderData - The shader data.
	 * @return {string} The vertex shader.
	 */
	_getGLSLVertexCode( shaderData ) {

		return `#version 300 es

${ this.getSignature() }

// extensions
${shaderData.extensions}

// precision
${ defaultPrecisions }

// uniforms
${shaderData.uniforms}

// varyings
${shaderData.varyings}

// attributes
${shaderData.attributes}

// codes
${shaderData.codes}

void main() {

	// vars
	${shaderData.vars}

	// transforms
	${shaderData.transforms}

	// flow
	${shaderData.flow}

	gl_PointSize = 1.0;

}
`;

	}

	/**
	 * Returns a GLSL fragment shader based on the given shader data.
	 *
	 * @private
	 * @param {Object} shaderData - The shader data.
	 * @return {string} The vertex shader.
	 */
	_getGLSLFragmentCode( shaderData ) {

		return `#version 300 es

${ this.getSignature() }

// extensions
${shaderData.extensions}

// precision
${ defaultPrecisions }

// uniforms
${shaderData.uniforms}

// varyings
${shaderData.varyings}

// codes
${shaderData.codes}

// structs
${shaderData.structs}

void main() {

	// vars
	${shaderData.vars}

	// flow
	${shaderData.flow}

}
`;

	}

	/**
	 * Controls the code build of the shader stages.
	 */
	buildCode() {

		const shadersData = this.material !== null ? { fragment: {}, vertex: {} } : { compute: {} };

		this.sortBindingGroups();

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

						flow += 'gl_Position = ';
						flow += `${ flowSlotData.result };`;

					} else if ( shaderStage === 'fragment' ) {

						if ( ! node.outputNode.isOutputStructNode ) {

							flow += 'fragColor = ';
							flow += `${ flowSlotData.result };`;

						}

					}

				}

			}

			const stageData = shadersData[ shaderStage ];

			stageData.extensions = this.getExtensions( shaderStage );
			stageData.uniforms = this.getUniforms( shaderStage );
			stageData.attributes = this.getAttributes( shaderStage );
			stageData.varyings = this.getVaryings( shaderStage );
			stageData.vars = this.getVars( shaderStage );
			stageData.structs = this.getStructs( shaderStage );
			stageData.codes = this.getCodes( shaderStage );
			stageData.transforms = this.getTransforms( shaderStage );
			stageData.flow = flow;

		}

		if ( this.material !== null ) {

			this.vertexShader = this._getGLSLVertexCode( shadersData.vertex );
			this.fragmentShader = this._getGLSLFragmentCode( shadersData.fragment );

		} else {

			this.computeShader = this._getGLSLVertexCode( shadersData.compute );

		}

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

		let uniformGPU = nodeData.uniformGPU;

		if ( uniformGPU === undefined ) {

			const group = node.groupNode;
			const groupName = group.name;

			const bindings = this.getBindGroupArray( groupName, shaderStage );

			if ( type === 'texture' ) {

				uniformGPU = new NodeSampledTexture( uniformNode.name, uniformNode.node, group );
				bindings.push( uniformGPU );

			} else if ( type === 'cubeTexture' ) {

				uniformGPU = new NodeSampledCubeTexture( uniformNode.name, uniformNode.node, group );
				bindings.push( uniformGPU );

			} else if ( type === 'texture3D' ) {

				uniformGPU = new NodeSampledTexture3D( uniformNode.name, uniformNode.node, group );
				bindings.push( uniformGPU );

			} else if ( type === 'buffer' ) {

				node.name = `NodeBuffer_${ node.id }`;
				uniformNode.name = `buffer${ node.id }`;

				const buffer = new NodeUniformBuffer( node, group );
				buffer.name = node.name;

				bindings.push( buffer );

				uniformGPU = buffer;

			} else {

				const uniformsStage = this.uniformGroups[ shaderStage ] || ( this.uniformGroups[ shaderStage ] = {} );

				let uniformsGroup = uniformsStage[ groupName ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new NodeUniformsGroup( shaderStage + '_' + groupName, group );
					//uniformsGroup.setVisibility( gpuShaderStageLib[ shaderStage ] );

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

}

export default GLSLNodeBuilder;
