import { GLSLNodeParser, NodeBuilder } from 'three/nodes';

const glslMethods = {
	atan2: 'atan'
};

class GLSL1NodeBuilder extends NodeBuilder {

	constructor( object, renderer, scene = null ) {

		super( object, renderer, new GLSLNodeParser(), scene );

		this.isGLSLNodeBuilder = true;

	}

	getMethod( method ) {

		return glslMethods[ method ] || method;

	}

	formatFunction( name, inputs, type, code ) {

		const parameters = inputs.map( input => input.type + ' ' + input.name ).join( ', ' );
		return `${ type } ${ name }( ${ parameters } ) {\n\n${ code }\n\n}`;

	}

	getTexture( texture, textureProperty, uvSnippet ) {

		if ( texture.isTextureCube ) {

			return `textureCube( ${textureProperty}, ${uvSnippet} )`;

		} else {

			return `texture2D( ${textureProperty}, ${uvSnippet} )`;

		}

	}

	getTextureBias( texture, textureProperty, uvSnippet, biasSnippet ) {

		if ( this.material.extensions !== undefined ) this.material.extensions.shaderTextureLOD = true;

		return `textureLod( ${textureProperty}, ${uvSnippet}, ${biasSnippet} )`;

	}

	getVars( shaderStage = this.shaderStage ) {

		const snippets = [];

		const vars = this.vars[ shaderStage ];

		for ( const variable of vars ) {

			snippets.push( `${ this.getVar( variable.type, variable.name ) };` );

		}

		return snippets.join( '\n\t' );

	}

	getUniforms( shaderStage = this.shaderStage ) {

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

				snippet = `uniform ${ precision }p ${ snippet }`;

			} else {

				snippet = `uniform ${ snippet }`;

			}

			output += snippet;

		}

		return output;

	}

	getAttributes( shaderStage = this.shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' ) {

			const attributes = this.attributes;

			for ( const attribute of attributes ) {

				snippet += `attribute ${attribute.type} ${attribute.name};\n`;

			}

		}

		return snippet;

	}

	getVaryings( shaderStage = this.shaderStage ) {

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

	_getGLSLComputeCode( /*shaderData*/ ) {

		console.warn( 'GLSL1NodeBuilder: compute shaders are not supported.' );

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
				flow: this.prepareShaderFlow( 'gl_Position = ', 'gl_FragColor = ' )
			} );

		}

		this.setShaderStage( null );

	}

	_getOperators() {

		return { // https://www.khronos.org/files/opengles_shading_language.pdf, section 5.1
			ops: [
				{ ops: [ '[]', '()', '.', 'post++', 'post--' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ 'pre++', 'pre--', 'un+', 'un-', 'un!' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '*', '/' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '+', '-' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '<', '>', '<=', '>=' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '==', '!=' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '&&' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '^^' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '||' ], maxPrec: Infinity, allowSelf: true },
				{ ops: [ '=', '+=', '-=', '*=', '/=' ], maxPrec: Infinity, allowSelf: true }
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

export default GLSL1NodeBuilder;
