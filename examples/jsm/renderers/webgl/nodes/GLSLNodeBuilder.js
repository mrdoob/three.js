import { MathNode, GLSLNodeParser, NodeBuilder, NodeMaterial } from '../../../nodes/Nodes.js';

import UniformsGroup from '../../common/UniformsGroup.js';
import { NodeSampledTexture, NodeSampledCubeTexture } from '../../common/nodes/NodeSampledTexture.js';

const glslMethods = {
	[ MathNode.ATAN2 ]: 'atan'
};

const precisionLib = {
	low: 'lowp',
	medium: 'mediump',
	high: 'highp'
};

class GLSLNodeBuilder extends NodeBuilder {

	constructor( object, renderer, scene = null ) {

		super( object, renderer, new GLSLNodeParser(), scene );

		this.uniformsGroup = {};

	}

	getMethod( method ) {

		return glslMethods[ method ] || method;

	}

	getTexture( texture, textureProperty, uvSnippet ) {

		if ( texture.isTextureCube ) {

			return `textureCube( ${textureProperty}, ${uvSnippet} )`;

		} else {

			return `texture( ${textureProperty}, ${uvSnippet} )`;

		}

	}

	getTextureLevel( texture, textureProperty, uvSnippet, biasSnippet ) {

		return `textureLod( ${textureProperty}, ${uvSnippet}, ${biasSnippet} )`;

	}

	getVars( shaderStage ) {

		const snippets = [];

		const vars = this.vars[ shaderStage ];

		for ( const variable of vars ) {

			snippets.push( `${ this.getVar( variable.type, variable.name ) };` );

		}

		return snippets.join( '\n\t' );

	}

	getUniforms( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		const bindingSnippets = [];
		const groupSnippets = [];

		for ( const uniform of uniforms ) {

			let snippet = null;
			let group = false;

			if ( uniform.type === 'texture' ) {

				snippet = `sampler2D ${uniform.name};`;

			} else if ( uniform.type === 'cubeTexture' ) {

				snippet = `samplerCube ${uniform.name};`;

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

				groupSnippets.push( snippet );

			} else {

				snippet = 'uniform ' + snippet;

				bindingSnippets.push( snippet );

			}

		}

		let output = '';

		if ( groupSnippets.length > 0 ) {

			output += this._getGLSLUniformStruct( shaderStage + 'NodeUniforms', groupSnippets.join( '\n' ) ) + '\n';

		}

		output += bindingSnippets.join( '\n' );

		return output;

	}

	getAttributes( shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' ) {

			const attributes = this.attributes;

			let location = 0;

			for ( const attribute of attributes ) {

				snippet += `layout( location = ${ location ++ } ) in ${ attribute.type } ${ attribute.name };\n`;

			}

		}

		return snippet;

	}

	getVaryings( shaderStage ) {

		let snippet = '';

		const varyings = this.varyings;

		if ( shaderStage === 'vertex' ) {

			for ( const varying of varyings ) {

				snippet += `${varying.needsInterpolation ? 'out' : '/*out*/'} ${varying.type} ${varying.name};\n`;

			}

		} else if ( shaderStage === 'fragment' ) {

			for ( const varying of varyings ) {

				if ( varying.needsInterpolation ) {

					snippet += `in ${varying.type} ${varying.name};\n`;

				}

			}

		}

		return snippet;

	}

	getVertexIndex() {

		return 'gl_VertexID';

	}

	getFrontFacing() {

		return 'gl_FrontFacing';

	}

	getFragCoord() {

		return 'gl_FragCoord';

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
precision highp float;
precision highp int;

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
precision highp float;
precision highp int;

// uniforms
${shaderData.uniforms}

// varyings
${shaderData.varyings}

// codes
${shaderData.codes}

layout( location = 0 ) out vec4 fragColor;

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

					} else if ( shaderStage === 'fragment' ) {

						flow += 'fragColor = ';

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

			this.vertexShader = this._getGLSLVertexCode( shadersData.vertex );
			this.fragmentShader = this._getGLSLFragmentCode( shadersData.fragment );

			//console.log( this.vertexShader );
			//console.log( this.fragmentShader );

		} else {

			console.warn( 'GLSLNodeBuilder: compute shaders are not supported.' );
			//this.computeShader = this._getGLSLComputeCode( shadersData.compute );

		}

	}

	getUniformFromNode( node, type, shaderStage, name = null ) {

		const uniformNode = super.getUniformFromNode( node, type, shaderStage, name );
		const nodeData = this.getDataFromNode( node, shaderStage );

		let uniformGPU = nodeData.uniformGPU;

		if ( uniformGPU === undefined ) {

			if ( type === 'texture' ) {

				uniformGPU = new NodeSampledTexture( uniformNode.name, uniformNode.node );

				this.bindings[ shaderStage ].push( uniformGPU );

			} else if ( type === 'cubeTexture' ) {

				uniformGPU = new NodeSampledCubeTexture( uniformNode.name, uniformNode.node );

				this.bindings[ shaderStage ].push( uniformGPU );

			} else {

				let uniformsGroup = this.uniformsGroup[ shaderStage ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new UniformsGroup( shaderStage + 'NodeUniforms' );
					//uniformsGroup.setVisibility( gpuShaderStageLib[ shaderStage ] );

					this.uniformsGroup[ shaderStage ] = uniformsGroup;

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
