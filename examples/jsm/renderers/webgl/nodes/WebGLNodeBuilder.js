import NodeBuilder, { defaultShaderStages } from 'three-nodes/core/NodeBuilder.js';
import NodeFrame from 'three-nodes/core/NodeFrame.js';
import SlotNode from './SlotNode.js';
import GLSLNodeParser from 'three-nodes/parsers/GLSLNodeParser.js';
import WebGLPhysicalContextNode from './WebGLPhysicalContextNode.js';

import { PerspectiveCamera, ShaderChunk, ShaderLib, UniformsUtils, UniformsLib,
	LinearEncoding, RGBAFormat, UnsignedByteType, sRGBEncoding } from 'three';

const nodeFrame = new NodeFrame();
nodeFrame.camera = new PerspectiveCamera();

const nodeShaderLib = {
	LineBasicNodeMaterial: ShaderLib.basic,
	MeshBasicNodeMaterial: ShaderLib.basic,
	PointsNodeMaterial: ShaderLib.points,
	MeshStandardNodeMaterial: ShaderLib.standard
};

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
		let type = material.type;

		// shader lib

		if ( material.isMeshStandardNodeMaterial ) type = 'MeshStandardNodeMaterial';
		else if ( material.isMeshBasicNodeMaterial ) type = 'MeshBasicNodeMaterial';
		else if ( material.isPointsNodeMaterial ) type = 'PointsNodeMaterial';
		else if ( material.isLineBasicNodeMaterial ) type = 'LineBasicNodeMaterial';

		if ( nodeShaderLib[ type ] !== undefined ) {

			const shaderLib = nodeShaderLib[ type ];
			const shader = this.shader;

			shader.vertexShader = shaderLib.vertexShader;
			shader.fragmentShader = shaderLib.fragmentShader;
			shader.uniforms = UniformsUtils.merge( [ shaderLib.uniforms, UniformsLib.lights ] );

		}

		if ( material.isMeshStandardNodeMaterial !== true ) {

			this.replaceCode( 'fragment', getIncludeSnippet( 'tonemapping_fragment' ), '' );

		}

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

		if ( material.iridescenceNode && material.iridescenceNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( material.iridescenceNode, 'IRIDESCENCE', 'float' ) );

		}

		if ( material.iridescenceIORNode && material.iridescenceIORNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( material.iridescenceIORNode, 'IRIDESCENCE_IOR', 'float' ) );

		}

		if ( material.iridescenceThicknessNode && material.iridescenceThicknessNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( material.iridescenceThicknessNode, 'IRIDESCENCE_THICKNESS', 'float' ) );

		}

		if ( material.envNode && material.envNode.isNode ) {

			const envRadianceNode = new WebGLPhysicalContextNode( WebGLPhysicalContextNode.RADIANCE, material.envNode );
			const envIrradianceNode = new WebGLPhysicalContextNode( WebGLPhysicalContextNode.IRRADIANCE, material.envNode );

			this.addSlot( 'fragment', new SlotNode( envRadianceNode, 'RADIANCE', 'vec3' ) );
			this.addSlot( 'fragment', new SlotNode( envIrradianceNode, 'IRRADIANCE', 'vec3' ) );

		}

		if ( material.positionNode && material.positionNode.isNode ) {

			this.addSlot( 'vertex', new SlotNode( material.positionNode, 'POSITION', 'vec3' ) );

		}

		if ( material.sizeNode && material.sizeNode.isNode ) {

			this.addSlot( 'vertex', new SlotNode( material.sizeNode, 'SIZE', 'float' ) );

		}

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
				if ( attribute.name === 'uv' || attribute.name === 'position' || attribute.name === 'normal' )
					continue;

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

		const isWebGL2 = this.renderer.capabilities.isWebGL2;

		if ( isWebGL2 && map && map.isTexture && map.format === RGBAFormat && map.type === UnsignedByteType && map.encoding === sRGBEncoding ) {

			return LinearEncoding; // disable inline decode for sRGB textures in WebGL 2

		}

		return super.getTextureEncodingFromMap( map );

	}

	getFrontFacing() {

		return 'gl_FrontFacing';

	}

	buildCode() {

		const shaderData = {};

		for ( const shaderStage of defaultShaderStages ) {

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

		this._updateUniforms();

		this.shader.vertexShader = this.vertexShader;
		this.shader.fragmentShader = this.fragmentShader;

		return this;

	}

	getSlot( shaderStage, name ) {

		const slots = this.slots[ shaderStage ];

		for ( const node of slots ) {

			if ( node.name === name ) {

				return this.getFlowData( node/*, shaderStage*/ );

			}

		}

	}

	_addSnippets() {

		this.parseInclude( 'fragment', 'lights_physical_fragment' );

		const colorSlot = this.getSlot( 'fragment', 'COLOR' );
		const opacityNode = this.getSlot( 'fragment', 'OPACITY' );
		const normalSlot = this.getSlot( 'fragment', 'NORMAL' );
		const emissiveNode = this.getSlot( 'fragment', 'EMISSIVE' );
		const roughnessNode = this.getSlot( 'fragment', 'ROUGHNESS' );
		const metalnessNode = this.getSlot( 'fragment', 'METALNESS' );
		const clearcoatNode = this.getSlot( 'fragment', 'CLEARCOAT' );
		const clearcoatRoughnessNode = this.getSlot( 'fragment', 'CLEARCOAT_ROUGHNESS' );
		const iridescenceNode = this.getSlot( 'fragment', 'IRIDESCENCE' );
		const iridescenceIORNode = this.getSlot( 'fragment', 'IRIDESCENCE_IOR' );
		const iridescenceThicknessNode = this.getSlot( 'fragment', 'IRIDESCENCE_THICKNESS' );

		const positionNode = this.getSlot( 'vertex', 'POSITION' );
		const sizeNode = this.getSlot( 'vertex', 'SIZE' );

		if ( colorSlot !== undefined ) {

			this.addCodeAfterInclude(
				'fragment',
				'color_fragment',
				`${colorSlot.code}\n\tdiffuseColor = ${colorSlot.result};`
			);

		}

		if ( opacityNode !== undefined ) {

			this.addCodeAfterInclude(
				'fragment',
				'alphatest_fragment',
				`${opacityNode.code}\n\tdiffuseColor.a = ${opacityNode.result};`
			);

		}

		if ( normalSlot !== undefined ) {

			this.addCodeAfterInclude(
				'fragment',
				'normal_fragment_begin',
				`${normalSlot.code}\n\tnormal = ${normalSlot.result};`
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

		if ( iridescenceNode !== undefined ) {

			this.addCodeAfterSnippet(
				'fragment',
				'iridescence_fragment',
				`${iridescenceNode.code}\n\tmaterial.iridescence = ${iridescenceNode.result};`
			);

		}

		if ( iridescenceIORNode !== undefined ) {

			this.addCodeAfterSnippet(
				'fragment',
				'iridescence_fragment',
				`${iridescenceIORNode.code}\n\tmaterial.iridescenceIOR = ${iridescenceIORNode.result};`
			);

		}

		if ( iridescenceThicknessNode !== undefined ) {

			this.addCodeAfterSnippet(
				'fragment',
				'iridescence_fragment',
				`${iridescenceThicknessNode.code}\n\tmaterial.iridescenceThickness = ${iridescenceThicknessNode.result};`
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

		for ( const shaderStage of defaultShaderStages ) {

			this.addCodeAfterSnippet(
				shaderStage,
				'main() {',
				this.flowCode[ shaderStage ]
			);

		}

	}

	_addUniforms() {

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
