import { GLSLNodeParser, NodeBuilder } from 'three/nodes';

import UniformsGroup from '../../common/UniformsGroup.js';
import { NodeSampledTexture, NodeSampledCubeTexture } from '../../common/nodes/NodeSampledTexture.js';

const glslMethods = {
	atan2: 'atan',
	textureDimensions: 'textureSize'
};

const supports = {
	instance: true
};

class GLSLNodeBuilder extends NodeBuilder {

	constructor( object, renderer, scene = null ) {

		super( object, renderer, new GLSLNodeParser(), scene );

		this.uniformsGroup = {};

		this.isGLSLNodeBuilder = true;

	}

	getMethod( method ) {

		return glslMethods[ method ] || method;

	}

	getPropertyName( node/*, shaderStage */ ) {

		if ( node.isOutputStructVar ) return '';

		return super.getPropertyName( node );

	}

	formatFunction( name, inputs, type, code ) {

		const parameters = inputs.map( input => input.type + ' ' + input.name ).join( ', ' );
		return `${ type } ${ name }( ${ parameters } ) {\n\n${ code }\n\n}`;

	}

	getTexture( texture, textureProperty, uvSnippet ) {

		if ( texture.isTextureCube ) {

			return `textureCube( ${textureProperty}, ${uvSnippet} )`;

		} else if ( texture.isDepthTexture ) {

			return `texture( ${textureProperty}, ${uvSnippet} ).x`;

		} else {

			return `texture( ${textureProperty}, ${uvSnippet} )`;

		}

	}

	getTextureLevel( texture, textureProperty, uvSnippet, biasSnippet ) {

		return `textureLod( ${textureProperty}, ${uvSnippet}, ${biasSnippet} )`;

	}

	getTextureCompare( texture, textureProperty, uvSnippet, compareSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `texture( ${textureProperty}, vec3( ${uvSnippet}, ${compareSnippet} ) )`;

		} else {

			console.error( `WebGPURenderer: THREE.DepthTexture.compareFunction() does not support ${ shaderStage } shader.` );

		}

	}

	getVars( shaderStage = this.shaderStage ) {

		const snippets = [];

		const vars = this.vars[ shaderStage ];

		for ( const variable of vars ) {

			if ( variable.isOutputStructVar ) continue;

			snippets.push( `${ this.getVar( variable.type, variable.name ) };` );

		}

		return snippets.join( '\n\t' );

	}

	getUniforms( shaderStage = this.shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		const bindingSnippets = [];
		const groupSnippets = [];

		for ( const uniform of uniforms ) {

			let snippet = null;
			let group = false;

			if ( uniform.type === 'texture' ) {

				if ( uniform.node.value.compareFunction ) {

					snippet = `sampler2DShadow ${uniform.name};`;

				} else {

					snippet = `sampler2D ${uniform.name};`;

				}

			} else if ( uniform.type === 'cubeTexture' ) {

				snippet = `samplerCube ${uniform.name};`;

			} else {

				const vectorType = this.getVectorType( uniform.type );

				snippet = `${vectorType} ${uniform.name};`;

				group = true;

			}

			const precision = uniform.node.precision;

			if ( precision !== null ) {

				snippet = `${ precision }p ${ snippet }`;

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

	getAttributes( shaderStage = this.shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' ) {

			const attributes = this.getAttributesArray();

			let location = 0;

			for ( const attribute of attributes ) {

				snippet += `layout( location = ${ location ++ } ) in ${ this.getType( attribute.type ) } ${ attribute.name };\n`;

			}

		}

		return snippet;

	}

	getStructs( shaderStage = this.shaderStage ) {

		const snippets = [];
		const structs = this.structs[ shaderStage ];

		if ( structs.length === 0 ) {

			return 'layout( location = 0 ) out vec4 fragColor;\n';

		}

		return '\n' + structs.map( s => this.getStructMembers( s ) ).join( '\n\n\n' ) + '\n';

	}

	getVaryings( shaderStage = this.shaderStage ) {

		let snippet = '';

		const varyings = this.varyings;

		if ( shaderStage === 'vertex' ) {

			for ( const varying of varyings ) {

				snippet += `${varying.needsInterpolation ? 'out' : '/*out*/'} ${ this.getType( varying.type ) } ${varying.name};\n`;

			}

		} else if ( shaderStage === 'fragment' ) {

			for ( const varying of varyings ) {

				if ( varying.needsInterpolation ) {

					snippet += `in ${ this.getType( varying.type ) } ${varying.name};\n`;

				}

			}

		}

		return snippet;

	}

	getUniformFromNode( node, name = null, type = node.getNodeType( this ), shaderStage = this.shaderStage ) {

		const nodeUniform = super.getUniformFromNode( node, name, type, shaderStage );
		const nodeData = this.getNodeData( node, shaderStage );

		let uniformGPU = nodeData.uniformGPU;

		if ( uniformGPU === undefined ) {

			if ( type === 'texture' ) {

				uniformGPU = new NodeSampledTexture( nodeUniform.name, nodeUniform.node );

				this.bindings[ shaderStage ].push( uniformGPU );

			} else if ( type === 'cubeTexture' ) {

				uniformGPU = new NodeSampledCubeTexture( nodeUniform.name, nodeUniform.node );

				this.bindings[ shaderStage ].push( uniformGPU );

			} else {

				let uniformsGroup = this.uniformsGroup[ shaderStage ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new UniformsGroup( shaderStage + 'NodeUniforms' );
					//uniformsGroup.setVisibility( gpuShaderStageLib[ shaderStage ] );

					this.uniformsGroup[ shaderStage ] = uniformsGroup;

					this.bindings[ shaderStage ].push( uniformsGroup );

				}

				uniformGPU = this.getUniformGPU( nodeUniform );

				uniformsGroup.addUniform( uniformGPU );

			}

			nodeData.uniformGPU = uniformGPU;

		}

		return nodeUniform;

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

	getVertexIndex() {

		return 'gl_VertexID';

	}

	getFrontFacing() {

		return 'gl_FrontFacing';

	}

	getFragCoord() {

		return 'gl_FragCoord';

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
precision lowp sampler2DShadow;

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

	_getGLSLComputeCode( /*shaderData*/ ) {

		console.warn( 'GLSLNodeBuilder: compute shaders are not supported.' );

	}

	buildCode() {

		for ( const shaderStage of this.getShaderStages() ) {

			this.setShaderStage( shaderStage );

			this[ shaderStage + 'Shader' ] = this[ `_getGLSL${ shaderStage[ 0 ].toUpperCase() + shaderStage.slice( 1 )}Code` ]( {
				uniforms: this.getUniforms(),
				attributes: this.getAttributes(),
				varyings: this.getVaryings(),
				vars: this.getVars(),
				structs: this.getStructs(),
				codes: this.getCodes(),
				flow: this.prepareShaderFlow( 'gl_Position = ', 'fragColor = ' )
			} );

		}

		this.setShaderStage( null );

	}

	_getOperators() {

		return { // https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf, section 5.1
			ops: [
				{ ops: [ '[]', '()', '.', 'post++', 'post--' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ 'pre++', 'pre--', 'un+', 'un-', 'un~', 'un!' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '*', '/', '%' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '+', '-' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '<<', '>>' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '<', '>', '<=', '>=' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '==', '!=' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '&' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '^' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '|' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '&&' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '^^' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '||' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '&=', '^=', '|=' ], maxPrec: Infinity, allowSelf: true }
			],
			replace: { // section 5.9
				'<': 'lessThan()',
				'<=': 'lessThanEqual()',
				'>': 'greaterThan()',
				'>=': 'greaterThanEqual()',
				'==': 'equal()',
				'!=': 'notEqual()'
			}
		};

	}

}

export default GLSLNodeBuilder;
