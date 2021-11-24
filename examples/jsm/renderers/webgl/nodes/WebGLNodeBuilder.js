import NodeBuilder from '../../nodes/core/NodeBuilder.js';
import SlotNode from './SlotNode.js';
import GLSLNodeParser from '../../nodes/parsers/GLSLNodeParser.js';
import WebGLPhysicalContextNode from './WebGLPhysicalContextNode.js';

import { ShaderChunk, LinearEncoding, RGBAFormat, UnsignedByteType, sRGBEncoding } from 'three';

const shaderStages = [ 'vertex', 'fragment' ];

function getIncludeSnippet( name ) {

	return `#include <${name}>`;

}

function getShaderStageProperty( shaderStage ) {

	return `${shaderStage}Shader`;

}

class WebGLNodeBuilder extends NodeBuilder {

	constructor( object, renderer, shader ) {

		super( object, renderer, new GLSLNodeParser() );

		this.shader = shader;
		this.slots = { vertex: [], fragment: [] };

		this._parseObject();

	}

	addSlot( shaderStage, slotNode ) {

		this.slots[ shaderStage ].push( slotNode );

		return this.addFlow( shaderStage, slotNode );

	}

	addFlowCode( code ) {

		if ( ! /;\s*$/.test( code ) ) {

			code += ';';

		}

		super.addFlowCode( code + '\n\t' );

	}

	_parseObject() {

		const material = this.material;

		// parse inputs

		if ( material.colorNode && material.colorNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( material.colorNode, 'COLOR', 'vec4' ) );

		}

		if ( material.opacityNode && material.opacityNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( material.opacityNode, 'OPACITY', 'float' ) );

		}

		if ( material.normalNode && material.normalNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( material.normalNode, 'NORMAL', 'vec3' ) );

		}

		if ( material.emissiveNode && material.emissiveNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( material.emissiveNode, 'EMISSIVE', 'vec3' ) );

		}

		if ( material.metalnessNode && material.metalnessNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( material.metalnessNode, 'METALNESS', 'float' ) );

		}

		if ( material.roughnessNode && material.roughnessNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( material.roughnessNode, 'ROUGHNESS', 'float' ) );

		}

		if ( material.clearcoatNode && material.clearcoatNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( material.clearcoatNode, 'CLEARCOAT', 'float' ) );

		}

		if ( material.clearcoatRoughnessNode && material.clearcoatRoughnessNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( material.clearcoatRoughnessNode, 'CLEARCOAT_ROUGHNESS', 'float' ) );

		}

		if ( material.envNode && material.envNode.isNode ) {

			const envRadianceNode = new WebGLPhysicalContextNode( WebGLPhysicalContextNode.RADIANCE, material.envNode );
			const envIrradianceNode = new WebGLPhysicalContextNode( WebGLPhysicalContextNode.IRRADIANCE, material.envNode );

			this.addSlot( 'fragment', new SlotNode( envRadianceNode, 'RADIANCE', 'vec3' ) );
			this.addSlot( 'fragment', new SlotNode( envIrradianceNode, 'IRRADIANCE', 'vec3' ) );

		}

		if ( material.sizeNode && material.sizeNode.isNode ) {

			this.addSlot( 'vertex', new SlotNode( material.sizeNode, 'SIZE', 'float' ) );

		}

		if ( material.positionNode && material.positionNode.isNode ) {

			this.addSlot( 'vertex', new SlotNode( material.positionNode, 'POSITION', 'vec3' ) );

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

		let source = this[ shaderProperty ];

		const index = source.indexOf( snippet );

		if ( index !== - 1 ) {

			const start = source.substring( 0, index + snippet.length );
			const end = source.substring( index + snippet.length );

			source = `${start}\n${code}\n${end}`;

		}

		this[ shaderProperty ] = source;

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

	getTextureEncodingFromMap( map ) {
/*
		const isWebGL2 = this.renderer.capabilities.isWebGL2;

		if ( isWebGL2 && map && map.isTexture && map.format === RGBAFormat && map.type === UnsignedByteType && map.encoding === sRGBEncoding ) {

			return LinearEncoding; // disable inline decode for sRGB textures in WebGL 2

		}
*/
		return super.getTextureEncodingFromMap( map );

	}

	buildCode() {

		const shaderData = {};

		for ( const shaderStage of shaderStages ) {

			const uniforms = this.getUniforms( shaderStage );
			const attributes = this.getAttributes( shaderStage );
			const varys = this.getVarys( shaderStage );
			const vars = this.getVars( shaderStage );
			const codes = this.getCodes( shaderStage );

			shaderData[ shaderStage ] = `${this.getSignature()}
// <node_builder>

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

// </node_builder>

${this.shader[ getShaderStageProperty( shaderStage ) ]}
`;

		}

		this.vertexShader = shaderData.vertex;
		this.fragmentShader = shaderData.fragment;


	}

	build() {

		super.build();

		this._addSnippets();
		this._addUniforms();

		this.shader.vertexShader = this.vertexShader;
		this.shader.fragmentShader = this.fragmentShader;

		return this;

	}

	getSlot( shaderStage, name ) {

		const slots = this.slots[ shaderStage ];

		for ( const node of slots ) {

			if ( node.name === name ) {

				return this.getFlowData( shaderStage, node );

			}

		}

	}

	_addSnippets() {

		this.parseInclude( 'fragment', 'lights_physical_fragment' );

		const colorSlot = this.getSlot( 'fragment', 'COLOR' );
		const normalSlot = this.getSlot( 'fragment', 'NORMAL' );
		const opacityNode = this.getSlot( 'fragment', 'OPACITY' );
		const emissiveNode = this.getSlot( 'fragment', 'EMISSIVE' );
		const roughnessNode = this.getSlot( 'fragment', 'ROUGHNESS' );
		const metalnessNode = this.getSlot( 'fragment', 'METALNESS' );
		const clearcoatNode = this.getSlot( 'fragment', 'CLEARCOAT' );
		const clearcoatRoughnessNode = this.getSlot( 'fragment', 'CLEARCOAT_ROUGHNESS' );

		const positionNode = this.getSlot( 'vertex', 'POSITION' );
		const sizeNode = this.getSlot( 'vertex', 'SIZE' );

		if ( colorSlot !== undefined ) {

			this.addCodeAfterInclude(
				'fragment',
				'color_fragment',
				`${colorSlot.code}\n\tdiffuseColor = ${colorSlot.result};`
			);

		}

		if ( normalSlot !== undefined ) {

			this.addCodeAfterInclude(
				'fragment',
				'normal_fragment_begin',
				`${normalSlot.code}\n\tnormal = ${normalSlot.result};`
			);

		}

		if ( opacityNode !== undefined ) {

			this.addCodeAfterInclude(
				'fragment',
				'alphamap_fragment',
				`${opacityNode.code}\n\tdiffuseColor.a = ${opacityNode.result};`
			);

		}

		if ( emissiveNode !== undefined ) {

			this.addCodeAfterInclude(
				'fragment',
				'emissivemap_fragment',
				`${emissiveNode.code}\n\ttotalEmissiveRadiance = ${emissiveNode.result};`
			);

		}

		if ( roughnessNode !== undefined ) {

			this.addCodeAfterInclude(
				'fragment',
				'roughnessmap_fragment',
				`${roughnessNode.code}\n\troughnessFactor = ${roughnessNode.result};`
			);

		}

		if ( metalnessNode !== undefined ) {

			this.addCodeAfterInclude(
				'fragment',
				'metalnessmap_fragment',
				`${metalnessNode.code}\n\tmetalnessFactor = ${metalnessNode.result};`
			);

		}

		if ( clearcoatNode !== undefined ) {

			this.addCodeAfterSnippet(
				'fragment',
				'material.clearcoatRoughness = clearcoatRoughness;',
				`${clearcoatNode.code}\n\tmaterial.clearcoat = ${clearcoatNode.result};`
			);

		}

		if ( clearcoatRoughnessNode !== undefined ) {

			this.addCodeAfterSnippet(
				'fragment',
				'material.clearcoatRoughness = clearcoatRoughness;',
				`${clearcoatRoughnessNode.code}\n\tmaterial.clearcoatRoughness = ${clearcoatRoughnessNode.result};`
			);

		}

		if ( positionNode !== undefined ) {

			this.addCodeAfterInclude(
				'vertex',
				'begin_vertex',
				`${positionNode.code}\n\ttransformed = ${positionNode.result};`
			);

		}

		if ( sizeNode !== undefined ) {

			this.addCodeAfterSnippet(
				'vertex',
				'gl_PointSize = size;',
				`${sizeNode.code}\n\tgl_PointSize = ${sizeNode.result};`
			);

		}

		for ( const shaderStage of shaderStages ) {

			this.addCodeAfterSnippet(
				shaderStage,
				'main() {',
				this.flowCode[ shaderStage ]
			);

		}

	}

	_addUniforms() {

		for ( const shaderStage of shaderStages ) {

			// uniforms

			for ( const uniform of this.uniforms[ shaderStage ] ) {

				this.shader.uniforms[ uniform.name ] = uniform;

			}

		}

	}

}

export { WebGLNodeBuilder };
