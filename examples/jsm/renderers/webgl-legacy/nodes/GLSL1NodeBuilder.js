import { MathNode, GLSLNodeParser, NodeBuilder } from '../../../nodes/Nodes.js';

const glslMethods = {
	[ MathNode.ATAN2 ]: 'atan'
};

const precisionLib = {
	low: 'lowp',
	medium: 'mediump',
	high: 'highp'
};

class GLSL1NodeBuilder extends NodeBuilder {

	constructor( object, renderer, scene = null ) {

		super( object, renderer, new GLSLNodeParser(), scene );

	}

	getMethod( method ) {

		return glslMethods[ method ] || method;

	}

	getTexture( texture, textureProperty, uvSnippet ) {

		if ( texture.isTextureCube ) {

			return `textureCube( ${textureProperty}, ${uvSnippet} )`;

		} else {

			return `texture2D( ${textureProperty}, ${uvSnippet} )`;

		}

	}

	getTextureBias( texture, textureProperty, uvSnippet, biasSnippet ) {

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

		let output = '';

		for ( const uniform of uniforms ) {

			let snippet = null;

			if ( uniform.type === 'texture' ) {

				snippet = `sampler2D ${uniform.name};\n`;

			} else if ( uniform.type === 'cubeTexture' ) {

				snippet = `samplerCube ${uniform.name};\n`;

			} else {

				const vectorType = this.getVectorType( uniform.type );

				snippet = `${vectorType} ${uniform.name};\n`;

			}

			const precision = uniform.node.precision;

			if ( precision !== null ) {

				snippet = 'uniform ' + precisionLib[ precision ] + ' ' + snippet;

			} else {

				snippet = 'uniform ' + snippet;

			}

			output += snippet;

		}

		return output;

	}

	getAttributes( shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' ) {

			const attributes = this.attributes;

			for ( const attribute of attributes ) {

				snippet += `attribute ${attribute.type} ${attribute.name};\n`;

			}

		}

		return snippet;

	}

	getVaryings( shaderStage ) {

		let snippet = '';

		const varyings = this.varyings;

		if ( shaderStage === 'vertex' ) {

			for ( const varying of varyings ) {

				snippet += `${varying.needsInterpolation ? 'varying' : '/*varying*/'} ${varying.type} ${varying.name};\n`;

			}

		} else if ( shaderStage === 'fragment' ) {

			for ( const varying of varyings ) {

				if ( varying.needsInterpolation ) {

					snippet += `varying ${varying.type} ${varying.name};\n`;

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

	_getGLSLVertexCode( shaderData ) {

		return `${ this.getSignature() }

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

}
`;

	}

	_getGLSLFragmentCode( shaderData ) {

		return `${ this.getSignature() }

// precision
precision highp float;
precision highp int;

// uniforms
${shaderData.uniforms}

// varyings
${shaderData.varyings}

// codes
${shaderData.codes}

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

						flow += 'gl_FragColor = ';

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

		} else {

			console.warn( 'GLSLNodeBuilder: compute shaders are not supported.' );
			//this.computeShader = this._getGLSLComputeCode( shadersData.compute );

		}

	}

}

export default GLSL1NodeBuilder;
