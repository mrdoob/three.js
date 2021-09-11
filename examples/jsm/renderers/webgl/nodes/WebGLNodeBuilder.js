import NodeBuilder from '../../nodes/core/NodeBuilder.js';
import NodeSlot from '../../nodes/core/NodeSlot.js';
import WebGLPhysicalContextNode from './WebGLPhysicalContextNode.js';

import { ShaderChunk } from 'three';

const shaderStages = [ 'vertex', 'fragment' ];

function getIncludeSnippet( name ) {

	return `#include <${name}>`;

}

function getShaderStageProperty( shaderStage ) {

	return `${shaderStage}Shader`;

}

class WebGLNodeBuilder extends NodeBuilder {

	constructor( material, renderer, shader ) {

		super( material, renderer );

		this.shader = shader;

		this._parseMaterial();

	}

	_parseMaterial() {

		const material = this.material;

		// parse inputs

		if ( material.colorNode && material.colorNode.isNode ) {

			this.addSlot( 'fragment', new NodeSlot( material.colorNode, 'COLOR', 'vec4' ) );

		}

		if ( material.opacityNode && material.opacityNode.isNode ) {

			this.addSlot( 'fragment', new NodeSlot( material.opacityNode, 'OPACITY', 'float' ) );

		}

		if ( material.normalNode && material.normalNode.isNode ) {

			this.addSlot( 'fragment', new NodeSlot( material.normalNode, 'NORMAL', 'vec3' ) );

		}

		if ( material.emissiveNode && material.emissiveNode.isNode ) {

			this.addSlot( 'fragment', new NodeSlot( material.emissiveNode, 'EMISSIVE', 'vec3' ) );

		}

		if ( material.metalnessNode && material.metalnessNode.isNode ) {

			this.addSlot( 'fragment', new NodeSlot( material.metalnessNode, 'METALNESS', 'float' ) );

		}

		if ( material.roughnessNode && material.roughnessNode.isNode ) {

			this.addSlot( 'fragment', new NodeSlot( material.roughnessNode, 'ROUGHNESS', 'float' ) );

		}

		if ( material.clearcoatNode && material.clearcoatNode.isNode ) {

			this.addSlot( 'fragment', new NodeSlot( material.clearcoatNode, 'CLEARCOAT', 'float' ) );

		}

		if ( material.clearcoatRoughnessNode && material.clearcoatRoughnessNode.isNode ) {

			this.addSlot( 'fragment', new NodeSlot( material.clearcoatRoughnessNode, 'CLEARCOAT_ROUGHNESS', 'float' ) );

		}

		if ( material.envNode && material.envNode.isNode ) {

			const envRadianceNode = new WebGLPhysicalContextNode( WebGLPhysicalContextNode.RADIANCE, material.envNode );
			const envIrradianceNode = new WebGLPhysicalContextNode( WebGLPhysicalContextNode.IRRADIANCE, material.envNode );

			this.addSlot( 'fragment', new NodeSlot( envRadianceNode, 'RADIANCE', 'vec3' ) );
			this.addSlot( 'fragment', new NodeSlot( envIrradianceNode, 'IRRADIANCE', 'vec3' ) );

		}

	}

	getTexture( textureProperty, uvSnippet, biasSnippet = null ) {

		if ( biasSnippet !== null ) {

			return `texture2D( ${textureProperty}, ${uvSnippet}, ${biasSnippet} )`;

		} else {

			return `texture2D( ${textureProperty}, ${uvSnippet} )`;

		}

	}

	getCubeTexture( textureProperty, uvSnippet, biasSnippet = null ) {

		const textureCube = 'textureCubeLodEXT'; // textureCubeLodEXT textureLod

		if ( biasSnippet !== null ) {

			return `${textureCube}( ${textureProperty}, ${uvSnippet}, ${biasSnippet} )`;

		} else {

			return `${textureCube}( ${textureProperty}, ${uvSnippet} )`;

		}

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
				if ( attribute.name === 'uv' || attribute.name === 'position' || attribute.name === 'normal' )
					continue;

				snippet += `attribute ${attribute.type} ${attribute.name}; `;

			}

		}

		return snippet;

	}

	getVarys( shaderStage ) {

		let snippet = '';

		const varys = this.varys;

		for ( let index = 0; index < varys.length; index ++ ) {

			const vary = varys[ index ];

			snippet += `varying ${vary.type} ${vary.name}; `;

		}

		return snippet;

	}

	addCodeAfterSnippet( shaderStage, snippet, code ) {

		const shaderProperty = getShaderStageProperty( shaderStage );

		let source = this.shader[ shaderProperty ];

		const index = source.indexOf( snippet );

		if ( index !== - 1 ) {

			const start = source.substring( 0, index + snippet.length );
			const end = source.substring( index + snippet.length );

			source = `${start}\n${code}\n${end}`;

		}

		this.shader[ shaderProperty ] = source;

	}

	addCodeAfterInclude( shaderStage, includeName, code ) {

		const includeSnippet = getIncludeSnippet( includeName );

		this.addCodeAfterSnippet( shaderStage, includeSnippet, code );

	}

	replaceCode( shaderStage, source, target ) {

		const shaderProperty = getShaderStageProperty( shaderStage );

		this.shader[ shaderProperty ] = this.shader[ shaderProperty ].replaceAll( source, target );

	}

	parseInclude( shaderStage, ...includes ) {

		for ( const name of includes ) {

			const includeSnippet = getIncludeSnippet( name );
			const code = ShaderChunk[ name ];

			this.replaceCode( shaderStage, includeSnippet, code );

		}

	}

	/*prependCode( code ) {

		this.shader.vertexShader = code + this.shader.vertexShader;
		this.shader.fragmentShader = code + this.shader.fragmentShader;

	}*/

	build() {

		super.build();

		this._addSnippets();
		this._buildShader();

		return this;

	}

	_addSnippets() {

		this.parseInclude( 'fragment', 'lights_physical_fragment' );

		this.addCodeAfterInclude( 'fragment', 'normal_fragment_begin',
			`#ifdef NODE_NORMAL

				NODE_CODE_NORMAL
				normal = NODE_NORMAL;

			#endif` );

		this.addCodeAfterInclude( 'fragment', 'color_fragment',
			`#ifdef NODE_COLOR

				NODE_CODE_COLOR
				diffuseColor = NODE_COLOR;

			#endif` );

		this.addCodeAfterInclude( 'fragment', 'alphamap_fragment',
			`#ifdef NODE_OPACITY

				NODE_CODE_OPACITY
				diffuseColor.a *= NODE_OPACITY;

			#endif` );

		this.addCodeAfterInclude( 'fragment', 'emissivemap_fragment',
			`#ifdef NODE_EMISSIVE

				NODE_CODE_EMISSIVE
				totalEmissiveRadiance = NODE_EMISSIVE;

			#endif` );

		this.addCodeAfterInclude( 'fragment', 'roughnessmap_fragment',
			`#ifdef NODE_ROUGHNESS

				NODE_CODE_ROUGHNESS
				roughnessFactor = NODE_ROUGHNESS;

			#endif` );

		this.addCodeAfterInclude( 'fragment', 'metalnessmap_fragment',
			`#ifdef NODE_METALNESS

				NODE_CODE_METALNESS
				metalnessFactor = NODE_METALNESS;

			#endif` );

		this.addCodeAfterSnippet( 'fragment', 'material.clearcoatRoughness = clearcoatRoughness;',
			`#ifdef NODE_CLEARCOAT

				NODE_CODE_CLEARCOAT
				material.clearcoat = NODE_CLEARCOAT;

			#endif

			#ifdef NODE_CLEARCOAT_ROUGHNESS

				NODE_CODE_CLEARCOAT_ROUGHNESS
				material.clearcoatRoughness = NODE_CLEARCOAT_ROUGHNESS;

			#endif` );

		this.addCodeAfterInclude( 'fragment', 'lights_fragment_begin',
			`#ifdef NODE_RADIANCE

				NODE_CODE_RADIANCE
				radiance += NODE_RADIANCE;

				NODE_CODE_IRRADIANCE
				iblIrradiance += PI * NODE_IRRADIANCE;

			#endif` );

		for ( const shaderStage of shaderStages ) {

			this.addCodeAfterSnippet( shaderStage, 'main() {',
				`#ifdef NODE_CODE

					NODE_CODE

				#endif` );

		}

	}

	_buildShader() {

		for ( const shaderStage of shaderStages ) {

			// uniforms

			for ( const uniform of this.uniforms[ shaderStage ] ) {

				this.shader.uniforms[ uniform.name ] = uniform;

			}

			// code

			const shaderProperty = getShaderStageProperty( shaderStage );

			const nodeCode = this[ shaderProperty ];

			this.shader[ shaderProperty ] = nodeCode + this.shader[ shaderProperty ];

		}

	}

}

export { WebGLNodeBuilder };
