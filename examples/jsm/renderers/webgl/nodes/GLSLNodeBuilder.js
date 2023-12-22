import { MathNode, GLSLNodeParser, NodeBuilder, NodeMaterial } from '../../../nodes/Nodes.js';

import UniformBuffer from '../../common/UniformBuffer.js';
import NodeUniformsGroup from '../../common/nodes/NodeUniformsGroup.js';

import { NodeSampledTexture, NodeSampledCubeTexture } from '../../common/nodes/NodeSampledTexture.js';

import { IntType } from 'three';

const glslMethods = {
	[ MathNode.ATAN2 ]: 'atan',
	textureDimensions: 'textureSize'
};

const precisionLib = {
	low: 'lowp',
	medium: 'mediump',
	high: 'highp'
};

const supports = {
	instance: true
};

const defaultPrecisions = `
precision highp float;
precision highp int;
precision mediump sampler2DArray;
precision lowp sampler2DShadow;
`;

class GLSLNodeBuilder extends NodeBuilder {

	constructor( object, renderer, scene = null ) {

		super( object, renderer, new GLSLNodeParser(), scene );

		this.uniformGroups = {};

	}

	getMethod( method ) {

		return glslMethods[ method ] || method;

	}

	getPropertyName( node, shaderStage ) {

		if ( node.isOutputStructVar ) return '';

		return super.getPropertyName( node, shaderStage );

	}

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

	generateTextureLoad( texture, textureProperty, uvIndexSnippet, depthSnippet, levelSnippet = '0' ) {

		if ( depthSnippet ) {

			return `texelFetch( ${ textureProperty }, ivec3( ${ uvIndexSnippet }, ${ depthSnippet } ), ${ levelSnippet } )`;

		} else {

			return `texelFetch( ${ textureProperty }, ${ uvIndexSnippet }, ${ levelSnippet } )`;

		}

	}

	generateTexture( texture, textureProperty, uvSnippet, depthSnippet ) {

		if ( texture.isTextureCube ) {

			return `textureCube( ${ textureProperty }, ${ uvSnippet } )`;

		} else if ( texture.isDepthTexture ) {

			return `texture( ${ textureProperty }, ${ uvSnippet } ).x`;

		} else {

			if ( depthSnippet ) uvSnippet = `vec3( ${ uvSnippet }, ${ depthSnippet } )`;

			return `texture( ${ textureProperty }, ${ uvSnippet } )`;

		}

	}

	generateTextureLevel( texture, textureProperty, uvSnippet, levelSnippet ) {

		return `textureLod( ${ textureProperty }, ${ uvSnippet }, ${ levelSnippet } )`;

	}

	generateTextureCompare( texture, textureProperty, uvSnippet, compareSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `texture( ${ textureProperty }, vec3( ${ uvSnippet }, ${ compareSnippet } ) )`;

		} else {

			console.error( `WebGPURenderer: THREE.DepthTexture.compareFunction() does not support ${ shaderStage } shader.` );

		}

	}

	getVars( shaderStage ) {

		const snippets = [];

		const vars = this.vars[ shaderStage ];

		if ( vars !== undefined ) {

			for ( const variable of vars ) {

				if ( variable.isOutputStructVar ) continue;

				snippets.push( `${ this.getVar( variable.type, variable.name ) };` );

			}

		}

		return snippets.join( '\n\t' );

	}

	getUniforms( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		const bindingSnippets = [];
		const uniformGroups = {};

		for ( const uniform of uniforms ) {

			let snippet = null;
			let group = false;

			if ( uniform.type === 'texture' ) {

				const texture = uniform.node.value;

				if ( texture.compareFunction ) {

					snippet = `sampler2DShadow ${ uniform.name };`;

				} else if ( texture.isDataArrayTexture === true ) {

					snippet = `sampler2DArray ${ uniform.name };`;

				} else {

					snippet = `sampler2D ${ uniform.name };`;

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

				snippet = `${vectorType} ${uniform.name};`;

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

	getAttributes( shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' ) {

			const attributes = this.getAttributesArray();

			let location = 0;

			for ( const attribute of attributes ) {

				snippet += `layout( location = ${ location ++ } ) in ${ attribute.type } ${ attribute.name };\n`;

			}

		}

		return snippet;

	}

	getStructMembers( struct ) {

		const snippets = [];
		const members = struct.getMemberTypes();

		for ( let i = 0; i < members.length; i ++ ) {

			const member = members[ i ];
			snippets.push( `layout( location = ${i} ) out ${ member} m${i};` );

		}

		return snippets.join( '\n' );

	}

	getStructs( shaderStage ) {

		const snippets = [];
		const structs = this.structs[ shaderStage ];

		if ( structs.length === 0 ) {

			return 'layout( location = 0 ) out vec4 fragColor;\n';

		}

		for ( let index = 0, length = structs.length; index < length; index ++ ) {

			const struct = structs[ index ];

			let snippet = '\n';
			snippet += this.getStructMembers( struct );
			snippet += '\n';

			snippets.push( snippet );

		}

		return snippets.join( '\n\n' );

	}

	getVaryings( shaderStage ) {

		let snippet = '';

		const varyings = this.varyings;

		if ( shaderStage === 'vertex' ) {

			for ( const varying of varyings ) {

				const type = varying.type;
				const flat = type === 'int' || type === 'uint' ? 'flat ' : '';

				snippet += `${flat}${varying.needsInterpolation ? 'out' : '/*out*/'} ${type} ${varying.name};\n`;

			}

		} else if ( shaderStage === 'fragment' ) {

			for ( const varying of varyings ) {

				if ( varying.needsInterpolation ) {

					const type = varying.type;
					const flat = type === 'int' || type === 'uint' ? 'flat ' : '';

					snippet += `${flat}in ${type} ${varying.name};\n`;

				}

			}

		}

		return snippet;

	}

	getVertexIndex() {

		return 'uint( gl_VertexID )';

	}

	getInstanceIndex() {

		return 'uint( gl_InstanceID )';

	}

	getFrontFacing() {

		return 'gl_FrontFacing';

	}

	getFragCoord() {

		return 'gl_FragCoord';

	}

	getFragDepth() {

		return 'gl_FragDepth';

	}

	isAvailable( name ) {

		return supports[ name ] === true;

	}


	isFlipY() {

		return true;

	}

	_getGLSLUniformStruct( name, vars ) {

		return `
layout( std140 ) uniform ${name} {
${vars}
};`;

	}

	_getGLSLVertexCode( shaderData ) {

		return `#version 300 es

${ this.getSignature() }

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

	// flow
	${shaderData.flow}

	gl_PointSize = 1.0;

}
`;

	}

	_getGLSLFragmentCode( shaderData ) {

		return `#version 300 es

${ this.getSignature() }

// precision
${ defaultPrecisions }

// uniforms
${shaderData.uniforms}

// varyings
${shaderData.varyings}

// codes
${shaderData.codes}

${shaderData.structs}

void main() {

	// vars
	${shaderData.vars}

	// flow
	${shaderData.flow}

}
`;

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

			stageData.uniforms = this.getUniforms( shaderStage );
			stageData.attributes = this.getAttributes( shaderStage );
			stageData.varyings = this.getVaryings( shaderStage );
			stageData.vars = this.getVars( shaderStage );
			stageData.structs = this.getStructs( shaderStage );
			stageData.codes = this.getCodes( shaderStage );
			stageData.flow = flow;

		}

		if ( this.material !== null ) {

			this.vertexShader = this._getGLSLVertexCode( shadersData.vertex );
			this.fragmentShader = this._getGLSLFragmentCode( shadersData.fragment );

		} else {

			console.warn( 'GLSLNodeBuilder: compute shaders are not supported.' );
			//this.computeShader = this._getGLSLComputeCode( shadersData.compute );

		}

	}

	getUniformFromNode( node, type, shaderStage, name = null ) {

		const uniformNode = super.getUniformFromNode( node, type, shaderStage, name );
		const nodeData = this.getDataFromNode( node, shaderStage, this.globalCache );

		let uniformGPU = nodeData.uniformGPU;

		if ( uniformGPU === undefined ) {

			if ( type === 'texture' ) {

				uniformGPU = new NodeSampledTexture( uniformNode.name, uniformNode.node );

				this.bindings[ shaderStage ].push( uniformGPU );

			} else if ( type === 'cubeTexture' ) {

				uniformGPU = new NodeSampledCubeTexture( uniformNode.name, uniformNode.node );

				this.bindings[ shaderStage ].push( uniformGPU );

			} else if ( type === 'buffer' ) {

				node.name = `NodeBuffer_${node.id}`;

				const buffer = new UniformBuffer( node.name, node.value );

				uniformNode.name = `buffer${node.id}`;

				this.bindings[ shaderStage ].push( buffer );

				uniformGPU = buffer;

			} else {

				const group = node.groupNode;
				const groupName = group.name;

				const uniformsStage = this.uniformGroups[ shaderStage ] || ( this.uniformGroups[ shaderStage ] = {} );

				let uniformsGroup = uniformsStage[ groupName ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new NodeUniformsGroup( shaderStage + '_' + groupName, group );
					//uniformsGroup.setVisibility( gpuShaderStageLib[ shaderStage ] );

					uniformsStage[ groupName ] = uniformsGroup;

					this.bindings[ shaderStage ].push( uniformsGroup );

				}

				uniformGPU = this.getNodeUniform( uniformNode, type );

				uniformsGroup.addUniform( uniformGPU );

			}

			nodeData.uniformGPU = uniformGPU;

		}

		return uniformNode;

	}

	build() {

		// @TODO: Move this code to super.build()

		const { object, material } = this;

		if ( material !== null ) {

			NodeMaterial.fromMaterial( material ).build( this );

		} else {

			this.addFlow( 'compute', object );

		}

		return super.build();

	}

}

export default GLSLNodeBuilder;
