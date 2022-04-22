import NodeBuilder, { defaultShaderStages } from 'three-nodes/core/NodeBuilder.js';
import NodeFrame from 'three-nodes/core/NodeFrame.js';
import GLSLNodeParser from 'three-nodes/parsers/GLSLNodeParser.js';
//import WebGLPhysicalContextNode from './WebGLPhysicalContextNode.js';

import { PerspectiveCamera, LinearEncoding, sRGBEncoding, RGBAFormat, UnsignedByteType } from 'three';

const nodeFrame = new NodeFrame();
nodeFrame.camera = new PerspectiveCamera();

class WebGLNodeBuilder extends NodeBuilder {

	constructor( object, renderer, shader ) {

		super( object, renderer, new GLSLNodeParser() );

		this.shader = shader;

	}

	addFlowCode( code ) {

		if ( ! /;\s*$/.test( code ) ) {

			code += ';';

		}

		super.addFlowCode( code + '\n\t' );

	}

	getTexture( textureProperty, uvSnippet ) {

		return `texture2D( ${textureProperty}, ${uvSnippet} )`;

	}

	getTextureBias( textureProperty, uvSnippet, biasSnippet ) {

		if ( this.material.extensions !== undefined ) this.material.extensions.shaderTextureLOD = true;

		return `textureLod( ${textureProperty}, ${uvSnippet}, ${biasSnippet} )`;

	}

	getCubeTexture( textureProperty, uvSnippet ) {

		return `textureCube( ${textureProperty}, ${uvSnippet} )`;

	}

	getCubeTextureBias( textureProperty, uvSnippet, biasSnippet ) {

		if ( this.material.extensions !== undefined ) this.material.extensions.shaderTextureLOD = true;

		return `textureLod( ${textureProperty}, ${uvSnippet}, ${biasSnippet} )`;

	}

	getUniforms( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		let snippet = '';

		for ( const uniform of uniforms ) {

			if ( uniform.type === 'texture' ) {

				snippet += `uniform sampler2D ${uniform.name}; `;

			} else if ( uniform.type === 'cubeTexture' ) {

				snippet += `uniform samplerCube ${uniform.name}; `;

			} else {

				const vectorType = this.getVectorType( uniform.type );

				snippet += `uniform ${vectorType} ${uniform.name}; `;

			}

		}

		return snippet;

	}

	getAttributes( shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' ) {

			const attributes = this.attributes;

			for ( let index = 0; index < attributes.length; index ++ ) {

				const attribute = attributes[ index ];

				// ignore common attributes to prevent redefinitions
				if ( attribute.name === 'uv' || attribute.name === 'position' || attribute.name === 'normal' ) continue;

				snippet += `attribute ${attribute.type} ${attribute.name}; `;

			}

		}

		return snippet;

	}

	getVarys( /* shaderStage */ ) {

		let snippet = '';

		const varys = this.varys;

		for ( let index = 0; index < varys.length; index ++ ) {

			const vary = varys[ index ];

			snippet += `varying ${vary.type} ${vary.name}; `;

		}

		return snippet;

	}

	addCodeAfterSnippet( shaderStage, snippet, code ) {

		let source = this.shader[ shaderStage + 'Shader' ];

		const index = source.indexOf( snippet );

		if ( index !== - 1 ) {

			const start = source.substring( 0, index + snippet.length );
			const end = source.substring( index + snippet.length );

			source = `${start}\n${code}\n${end}`;

		}

		this.shader[ shaderStage + 'Shader' ] = source;

	}

	getTextureEncodingFromMap( map ) {

		const isWebGL2 = this.renderer.capabilities.isWebGL2;

		if ( isWebGL2 && map && map.isTexture && map.format === RGBAFormat && map.type === UnsignedByteType && map.encoding === sRGBEncoding ) {

			return LinearEncoding; // disable inline decode for sRGB textures in WebGL 2

		}

		return super.getTextureEncodingFromMap( map );

	}

	buildCode() {

		for ( const shaderStage of defaultShaderStages ) {

			const uniforms = this.getUniforms( shaderStage );
			const attributes = this.getAttributes( shaderStage );
			const varys = this.getVarys( shaderStage );
			const vars = this.getVars( shaderStage );
			const codes = this.getCodes( shaderStage );

			this.shader[ shaderStage + 'Shader' ] = `${this.getSignature()}

// uniforms
${uniforms}

// attributes
${attributes}

// varys
${varys}

// vars
${vars}

// codes
${codes}

${this.shader[ shaderStage + 'Shader' ]}
`;

		}

		this._buildFlowCode();
		this._buildUniforms();

		this._updateUniforms();

	}

	_buildFlowCode() {

		for ( const shaderStage of defaultShaderStages ) {

			this.addCodeAfterSnippet(
				shaderStage,
				'main() {',
				this.flowCode[ shaderStage ]
			);

		}

	}

	_buildUniforms() {

		for ( const shaderStage of defaultShaderStages ) {

			// uniforms

			for ( const uniform of this.uniforms[ shaderStage ] ) {

				this.shader.uniforms[ uniform.name ] = uniform;

			}

		}

	}

	_updateUniforms() {

		nodeFrame.object = this.object;
		nodeFrame.renderer = this.renderer;

		for ( const node of this.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

}

export { WebGLNodeBuilder };
