import { defaultShaderStages, NodeFrame, MathNode, GLSLNodeParser, NodeBuilder, normalView } from 'three/nodes';
import SlotNode from './SlotNode.js';
import { PerspectiveCamera, ShaderChunk, ShaderLib, UniformsUtils, UniformsLib } from 'three';

const nodeFrame = new NodeFrame();
nodeFrame.camera = new PerspectiveCamera();

const nodeShaderLib = {
	LineBasicNodeMaterial: ShaderLib.basic,
	MeshBasicNodeMaterial: ShaderLib.basic,
	PointsNodeMaterial: ShaderLib.points,
	MeshStandardNodeMaterial: ShaderLib.standard,
	MeshPhysicalNodeMaterial: ShaderLib.physical,
	MeshPhongNodeMaterial: ShaderLib.phong
};

const glslMethods = {
	[ MathNode.ATAN2 ]: 'atan'
};

const precisionLib = {
	low: 'lowp',
	medium: 'mediump',
	high: 'highp'
};

function getIncludeSnippet( name ) {

	return `#include <${name}>`;

}

function getShaderStageProperty( shaderStage ) {

	return `${shaderStage}Shader`;

}

class WebGLNodeBuilder extends NodeBuilder {

	constructor( object, renderer, shader, material = null ) {

		super( object, renderer, new GLSLNodeParser(), null, material );

		this.shader = shader;
		this.slots = { vertex: [], fragment: [] };

		this._parseShaderLib();
		this._parseInclude( 'fragment', 'lights_physical_fragment', 'clearcoat_normal_fragment_begin', 'transmission_fragment' );
		this._parseObject();

		this._sortSlotsToFlow();

	}

	getMethod( method ) {

		return glslMethods[ method ] || method;

	}

	addSlot( shaderStage, slotNode ) {

		this.slots[ shaderStage ].push( slotNode );

	}

	_parseShaderLib() {

		const material = this.material;

		let type = material.type;

		// see https://github.com/mrdoob/three.js/issues/23707

		if ( material.isMeshPhysicalNodeMaterial ) type = 'MeshPhysicalNodeMaterial';
		else if ( material.isMeshStandardNodeMaterial ) type = 'MeshStandardNodeMaterial';
		else if ( material.isMeshPhongNodeMaterial ) type = 'MeshPhongNodeMaterial';
		else if ( material.isMeshBasicNodeMaterial ) type = 'MeshBasicNodeMaterial';
		else if ( material.isPointsNodeMaterial ) type = 'PointsNodeMaterial';
		else if ( material.isLineBasicNodeMaterial ) type = 'LineBasicNodeMaterial';

		// shader lib

		if ( nodeShaderLib[ type ] !== undefined ) {

			const shaderLib = nodeShaderLib[ type ];
			const shader = this.shader;

			shader.vertexShader = shaderLib.vertexShader;
			shader.fragmentShader = shaderLib.fragmentShader;
			shader.uniforms = UniformsUtils.merge( [ shaderLib.uniforms, UniformsLib.lights ] );

		}

	}

	_parseObject() {

		const { material, renderer } = this;

		this.addSlot( 'fragment', new SlotNode( {
			node: normalView,
			nodeType: 'vec3',
			source: getIncludeSnippet( 'clipping_planes_fragment' ),
			target: 'vec3 TransformedNormalView = %RESULT%;',
			inclusionType: 'append'
		} ) );

		if ( renderer.toneMappingNode && renderer.toneMappingNode.isNode === true ) {

			this.addSlot( 'fragment', new SlotNode( {
				node: material.colorNode,
				nodeType: 'vec4',
				source: getIncludeSnippet( 'tonemapping_fragment' ),
				target: ''
			} ) );

		}

		// parse inputs

		if ( material.colorNode && material.colorNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( {
				node: material.colorNode,
				nodeType: 'vec4',
				source: 'vec4 diffuseColor = vec4( diffuse, opacity );',
				target: 'vec4 diffuseColor = %RESULT%; diffuseColor.a *= opacity;',
			} ) );

		}

		if ( material.opacityNode && material.opacityNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( {
				node: material.opacityNode,
				nodeType: 'float',
				source: getIncludeSnippet( 'alphatest_fragment' ),
				target: 'diffuseColor.a = %RESULT%;',
				inclusionType: 'append'
			} ) );

		}

		if ( material.normalNode && material.normalNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( {
				node: material.normalNode,
				nodeType: 'vec3',
				source: getIncludeSnippet( 'normal_fragment_begin' ),
				target: 'normal = %RESULT%;',
				inclusionType: 'append'
			} ) );

		}

		if ( material.emissiveNode && material.emissiveNode.isNode ) {

			this.addSlot( 'fragment', new SlotNode( {
				node: material.emissiveNode,
				nodeType: 'vec3',
				source: getIncludeSnippet( 'emissivemap_fragment' ),
				target: 'totalEmissiveRadiance = %RESULT%;',
				inclusionType: 'append'
			} ) );

		}

		if ( material.isMeshStandardNodeMaterial ) {

			if ( material.metalnessNode && material.metalnessNode.isNode ) {

				this.addSlot( 'fragment', new SlotNode( {
					node: material.metalnessNode,
					nodeType: 'float',
					source: getIncludeSnippet( 'metalnessmap_fragment' ),
					target: 'metalnessFactor = %RESULT%;',
					inclusionType: 'append'
				} ) );

			}

			if ( material.roughnessNode && material.roughnessNode.isNode ) {

				this.addSlot( 'fragment', new SlotNode( {
					node: material.roughnessNode,
					nodeType: 'float',
					source: getIncludeSnippet( 'roughnessmap_fragment' ),
					target: 'roughnessFactor = %RESULT%;',
					inclusionType: 'append'
				} ) );

			}

			if ( material.isMeshPhysicalNodeMaterial ) {

				if ( material.clearcoatNode && material.clearcoatNode.isNode ) {

					this.addSlot( 'fragment', new SlotNode( {
						node: material.clearcoatNode,
						nodeType: 'float',
						source: 'material.clearcoat = clearcoat;',
						target: 'material.clearcoat = %RESULT%;'
					} ) );

					if ( material.clearcoatRoughnessNode && material.clearcoatRoughnessNode.isNode ) {

						this.addSlot( 'fragment', new SlotNode( {
							node: material.clearcoatRoughnessNode,
							nodeType: 'float',
							source: 'material.clearcoatRoughness = clearcoatRoughness;',
							target: 'material.clearcoatRoughness = %RESULT%;'
						} ) );

					}

					if ( material.clearcoatNormalNode && material.clearcoatNormalNode.isNode ) {

						this.addSlot( 'fragment', new SlotNode( {
							node: material.clearcoatNormalNode,
							nodeType: 'vec3',
							source: 'vec3 clearcoatNormal = nonPerturbedNormal;',
							target: 'vec3 clearcoatNormal = %RESULT%;'
						} ) );

					}

					material.defines.USE_CLEARCOAT = '';

				} else {

					delete material.defines.USE_CLEARCOAT;

				}

				if ( material.sheenNode && material.sheenNode.isNode ) {

					this.addSlot( 'fragment', new SlotNode( {
						node: material.sheenNode,
						nodeType: 'vec3',
						source: 'material.sheenColor = sheenColor;',
						target: 'material.sheenColor = %RESULT%;'
					} ) );

					if ( material.sheenRoughnessNode && material.sheenRoughnessNode.isNode ) {

						this.addSlot( 'fragment', new SlotNode( {
							node: material.sheenRoughnessNode,
							nodeType: 'float',
							source: 'material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );',
							target: 'material.sheenRoughness = clamp( %RESULT%, 0.07, 1.0 );'
						} ) );

					}

					material.defines.USE_SHEEN = '';

				} else {

					delete material.defines.USE_SHEEN;

				}

				if ( material.iridescenceNode && material.iridescenceNode.isNode ) {

					this.addSlot( 'fragment', new SlotNode( {
						node: material.iridescenceNode,
						nodeType: 'float',
						source: 'material.iridescence = iridescence;',
						target: 'material.iridescence = %RESULT%;'
					} ) );

					if ( material.iridescenceIORNode && material.iridescenceIORNode.isNode ) {

						this.addSlot( 'fragment', new SlotNode( {
							node: material.iridescenceIORNode,
							nodeType: 'float',
							source: 'material.iridescenceIOR = iridescenceIOR;',
							target: 'material.iridescenceIOR = %RESULT%;'
						} ) );

					}

					if ( material.iridescenceThicknessNode && material.iridescenceThicknessNode.isNode ) {

						this.addSlot( 'fragment', new SlotNode( {
							node: material.iridescenceThicknessNode,
							nodeType: 'float',
							source: 'material.iridescenceThickness = iridescenceThicknessMaximum;',
							target: 'material.iridescenceThickness = %RESULT%;'
						} ) );

					}

					material.defines.USE_IRIDESCENCE = '';

				} else {

					delete material.defines.USE_IRIDESCENCE;

				}

				if ( material.iorNode && material.iorNode.isNode ) {

					this.addSlot( 'fragment', new SlotNode( {
						node: material.iorNode,
						nodeType: 'float',
						source: 'material.ior = ior;',
						target: 'material.ior = %RESULT%;'
					} ) );

				}

				if ( material.specularColorNode && material.specularColorNode.isNode ) {

					this.addSlot( 'fragment', new SlotNode( {
						node: material.specularColorNode,
						nodeType: 'vec3',
						source: 'vec3 specularColorFactor = specularColor;',
						target: 'vec3 specularColorFactor = %RESULT%;'
					} ) );

				}

				if ( material.specularIntensityNode && material.specularIntensityNode.isNode ) {

					this.addSlot( 'fragment', new SlotNode( {
						node: material.specularIntensityNode,
						nodeType: 'float',
						source: 'float specularIntensityFactor = specularIntensity;',
						target: 'float specularIntensityFactor = %RESULT%;'
					} ) );

				}

				if ( material.transmissionNode && material.transmissionNode.isNode ) {

					this.addSlot( 'fragment', new SlotNode( {
						node: material.transmissionNode,
						nodeType: 'float',
						source: 'material.transmission = transmission;',
						target: 'material.transmission = %RESULT%;'
					} ) );

					if ( material.thicknessNode && material.thicknessNode.isNode ) {

						this.addSlot( 'fragment', new SlotNode( {
							node: material.thicknessNode,
							nodeType: 'float',
							source: 'material.thickness = thickness;',
							target: 'material.thickness = %RESULT%;'
						} ) );

					}

					if ( material.attenuationDistanceNode && material.attenuationDistanceNode.isNode ) {

						this.addSlot( 'fragment', new SlotNode( {
							node: material.attenuationDistanceNode,
							nodeType: 'float',
							source: 'material.attenuationDistance = attenuationDistance;',
							target: 'material.attenuationDistance = %RESULT%;'
						} ) );

					}

					if ( material.attenuationColorNode && material.attenuationColorNode.isNode ) {

						this.addSlot( 'fragment', new SlotNode( {
							node: material.attenuationColorNode,
							nodeType: 'vec3',
							source: 'material.attenuationColor = attenuationColor;',
							target: 'material.attenuationColor = %RESULT%;'
						} ) );

					}

					material.transmission = 1;
					material.defines.USE_TRANSMISSION = '';

				} else {

					material.transmission = 0;
					delete material.defines.USE_TRANSMISSION;

				}

			}

		}

		//

		if ( material.positionNode && material.positionNode.isNode ) {

			this.addSlot( 'vertex', new SlotNode( {
				node: material.positionNode,
				nodeType: 'vec3',
				source: getIncludeSnippet( 'begin_vertex' ),
				target: 'transformed = %RESULT%;',
				inclusionType: 'append'
			} ) );

		}

		if ( material.sizeNode && material.sizeNode.isNode ) {

			this.addSlot( 'vertex', new SlotNode( {
				node: material.sizeNode,
				nodeType: 'float',
				source: 'gl_PointSize = size;',
				target: 'gl_PointSize = %RESULT%;'
			} ) );

		}

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

	getUniforms( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		let output = '';

		for ( const uniform of uniforms ) {

			if ( /^(modelViewMatrix|projectionMatrix)$/.test( uniform.name ) )
				continue;

			let snippet = null;

			if ( uniform.type === 'texture' ) {

				snippet = `sampler2D ${uniform.name}; `;

			} else if ( uniform.type === 'cubeTexture' ) {

				snippet = `samplerCube ${uniform.name}; `;

			} else {

				const vectorType = this.getVectorType( uniform.type );

				snippet = `${vectorType} ${uniform.name}; `;

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

				// ignore common attributes to prevent redefinitions
				if ( /^(position|normal|uv[1-3]?)$/.test( attribute.name ) )
					continue;

				snippet += `attribute ${attribute.type} ${attribute.name}; `;

			}

		}

		return snippet;

	}

	getVaryings( shaderStage ) {

		let snippet = '';

		const varyings = this.varyings;

		if ( shaderStage === 'vertex' ) {

			for ( const varying of varyings ) {

				snippet += `${varying.needsInterpolation ? 'varying' : '/*varying*/'} ${varying.type} ${varying.name}; `;

			}

		} else if ( shaderStage === 'fragment' ) {

			for ( const varying of varyings ) {

				if ( varying.needsInterpolation ) {

					snippet += `varying ${varying.type} ${varying.name}; `;

				}

			}

		}

		return snippet;

	}

	addCode( shaderStage, source, code, scope = this ) {

		const shaderProperty = getShaderStageProperty( shaderStage );

		let snippet = scope[ shaderProperty ];

		const index = snippet.indexOf( source );

		if ( index !== - 1 ) {

			const start = snippet.substring( 0, index + source.length );
			const end = snippet.substring( index + source.length );

			snippet = `${start}\n${code}\n${end}`;

		}

		scope[ shaderProperty ] = snippet;

	}

	replaceCode( shaderStage, source, target, scope = this ) {

		const shaderProperty = getShaderStageProperty( shaderStage );

		scope[ shaderProperty ] = scope[ shaderProperty ].replaceAll( source, target );

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

	buildCode() {

		const shaderData = {};

		for ( const shaderStage of defaultShaderStages ) {

			const uniforms = this.getUniforms( shaderStage );
			const attributes = this.getAttributes( shaderStage );
			const varyings = this.getVaryings( shaderStage );
			const vars = this.getVars( shaderStage );
			const codes = this.getCodes( shaderStage );

			shaderData[ shaderStage ] = `${this.getSignature()}
// <node_builder>

// uniforms
${uniforms}

// attributes
${attributes}

// varyings
${varyings}

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

	_parseInclude( shaderStage, ...includes ) {

		for ( const name of includes ) {

			const includeSnippet = getIncludeSnippet( name );
			const code = ShaderChunk[ name ];

			const shaderProperty = getShaderStageProperty( shaderStage );

			this.shader[ shaderProperty ] = this.shader[ shaderProperty ].replaceAll( includeSnippet, code );

		}

	}

	_sortSlotsToFlow() {

		for ( const shaderStage of defaultShaderStages ) {

			const sourceCode = this.shader[ getShaderStageProperty( shaderStage ) ];

			const slots = this.slots[ shaderStage ].sort( ( slotA, slotB ) => {

				return sourceCode.indexOf( slotA.source ) > sourceCode.indexOf( slotB.source ) ? 1 : - 1;

			} );

			for ( const slotNode of slots ) {

				this.addFlow( shaderStage, slotNode );

			}

		}

	}

	_addSnippets() {

		for ( const shaderStage of defaultShaderStages ) {

			for ( const slotNode of this.slots[ shaderStage ] ) {

				const flowData = this.getFlowData( slotNode/*, shaderStage*/ );

				const inclusionType = slotNode.inclusionType;
				const source = slotNode.source;
				const target = flowData.code + '\n\t' + slotNode.target.replace( '%RESULT%', flowData.result );

				if ( inclusionType === 'append' ) {

					this.addCode( shaderStage, source, target );

				} else if ( inclusionType === 'replace' ) {

					this.replaceCode( shaderStage, source, target );

				} else {

					console.warn( `Inclusion type "${ inclusionType }" not compatible.` );

				}

			}

			this.addCode(
				shaderStage,
				'main() {',
				'\n\t' + this.flowCode[ shaderStage ]
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
