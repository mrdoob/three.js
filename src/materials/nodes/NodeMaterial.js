import { Material } from '../Material.js';
import { NormalBlending } from '../../constants.js';

import { getNodeChildren, getCacheKey } from '../../nodes/core/NodeUtils.js';
import { attribute } from '../../nodes/core/AttributeNode.js';
import { output, diffuseColor, emissive, varyingProperty } from '../../nodes/core/PropertyNode.js';
import { materialAlphaTest, materialColor, materialOpacity, materialEmissive, materialNormal, materialLightMap, materialAOMap } from '../../nodes/accessors/MaterialNode.js';
import { modelViewProjection } from '../../nodes/accessors/ModelViewProjectionNode.js';
import { normalLocal } from '../../nodes/accessors/Normal.js';
import { instancedMesh } from '../../nodes/accessors/InstancedMeshNode.js';
import { batch } from '../../nodes/accessors/BatchNode.js';
import { materialReference } from '../../nodes/accessors/MaterialReferenceNode.js';
import { positionLocal, positionView } from '../../nodes/accessors/Position.js';
import { skinningReference } from '../../nodes/accessors/SkinningNode.js';
import { morphReference } from '../../nodes/accessors/MorphNode.js';
import { mix } from '../../nodes/math/MathNode.js';
import { float, vec3, vec4 } from '../../nodes/tsl/TSLBase.js';
import AONode from '../../nodes/lighting/AONode.js';
import { lightingContext } from '../../nodes/lighting/LightingContextNode.js';
import IrradianceNode from '../../nodes/lighting/IrradianceNode.js';
import { depth, viewZToLogarithmicDepth, viewZToOrthographicDepth } from '../../nodes/display/ViewportDepthNode.js';
import { cameraFar, cameraNear } from '../../nodes/accessors/Camera.js';
import { clipping, clippingAlpha, hardwareClipping } from '../../nodes/accessors/ClippingNode.js';
import NodeMaterialObserver from './manager/NodeMaterialObserver.js';
import getAlphaHashThreshold from '../../nodes/functions/material/getAlphaHashThreshold.js';

class NodeMaterial extends Material {

	static get type() {

		return 'NodeMaterial';

	}

	get type() {

		return this.constructor.type;

	}

	set type( _value ) { /* */ }

	constructor() {

		super();

		this.isNodeMaterial = true;

		this.forceSinglePass = false;

		this.fog = true;
		this.lights = false;
		this.hardwareClipping = false;

		this.lightsNode = null;
		this.envNode = null;
		this.aoNode = null;

		this.colorNode = null;
		this.normalNode = null;
		this.opacityNode = null;
		this.backdropNode = null;
		this.backdropAlphaNode = null;
		this.alphaTestNode = null;

		this.positionNode = null;
		this.geometryNode = null;

		this.depthNode = null;
		this.shadowPositionNode = null;
		this.receivedShadowNode = null;
		this.castShadowNode = null;

		this.outputNode = null;
		this.mrtNode = null;

		this.fragmentNode = null;
		this.vertexNode = null;

	}

	customProgramCacheKey() {

		return this.type + getCacheKey( this );

	}

	build( builder ) {

		this.setup( builder );

	}

	setupObserver( builder ) {

		return new NodeMaterialObserver( builder );

	}

	setup( builder ) {

		builder.context.setupNormal = () => this.setupNormal( builder );

		const renderer = builder.renderer;
		const renderTarget = renderer.getRenderTarget();

		// < VERTEX STAGE >

		builder.addStack();

		builder.stack.outputNode = this.vertexNode || this.setupPosition( builder );

		if ( this.geometryNode !== null ) {

			builder.stack.outputNode = builder.stack.outputNode.bypass( this.geometryNode );

		}

		builder.addFlow( 'vertex', builder.removeStack() );

		// < FRAGMENT STAGE >

		builder.addStack();

		let resultNode;

		const clippingNode = this.setupClipping( builder );

		if ( this.depthWrite === true ) {

			// only write depth if depth buffer is configured

			if ( renderTarget !== null ) {

				if ( renderTarget.depthBuffer === true ) this.setupDepth( builder );

			} else {

				if ( renderer.depth === true ) this.setupDepth( builder );

			}

		}

		if ( this.fragmentNode === null ) {

			this.setupDiffuseColor( builder );
			this.setupVariants( builder );

			const outgoingLightNode = this.setupLighting( builder );

			if ( clippingNode !== null ) builder.stack.add( clippingNode );

			// force unsigned floats - useful for RenderTargets

			const basicOutput = vec4( outgoingLightNode, diffuseColor.a ).max( 0 );

			resultNode = this.setupOutput( builder, basicOutput );

			// OUTPUT NODE

			output.assign( resultNode );

			//

			if ( this.outputNode !== null ) resultNode = this.outputNode;

			// MRT

			if ( renderTarget !== null ) {

				const mrt = renderer.getMRT();
				const materialMRT = this.mrtNode;

				if ( mrt !== null ) {

					resultNode = mrt;

					if ( materialMRT !== null ) {

						resultNode = mrt.merge( materialMRT );

					}

				} else if ( materialMRT !== null ) {

					resultNode = materialMRT;

				}

			}

		} else {

			let fragmentNode = this.fragmentNode;

			if ( fragmentNode.isOutputStructNode !== true ) {

				fragmentNode = vec4( fragmentNode );

			}

			resultNode = this.setupOutput( builder, fragmentNode );

		}

		builder.stack.outputNode = resultNode;

		builder.addFlow( 'fragment', builder.removeStack() );

		// < MONITOR >

		builder.monitor = this.setupObserver( builder );

	}

	setupClipping( builder ) {

		if ( builder.clippingContext === null ) return null;

		const { unionPlanes, intersectionPlanes } = builder.clippingContext;

		let result = null;

		if ( unionPlanes.length > 0 || intersectionPlanes.length > 0 ) {

			const samples = builder.renderer.samples;

			if ( this.alphaToCoverage && samples > 1 ) {

				// to be added to flow when the color/alpha value has been determined
				result = clippingAlpha();

			} else {

				builder.stack.add( clipping() );

			}

		}

		return result;

	}

	setupHardwareClipping( builder ) {

		this.hardwareClipping = false;

		if ( builder.clippingContext === null ) return;

		const candidateCount = builder.clippingContext.unionPlanes.length;

		// 8 planes supported by WebGL ANGLE_clip_cull_distance and WebGPU clip-distances

		if ( candidateCount > 0 && candidateCount <= 8 && builder.isAvailable( 'clipDistance' ) ) {

			builder.stack.add( hardwareClipping() );

			this.hardwareClipping = true;

		}

		return;

	}

	setupDepth( builder ) {

		const { renderer, camera } = builder;

		// Depth

		let depthNode = this.depthNode;

		if ( depthNode === null ) {

			const mrt = renderer.getMRT();

			if ( mrt && mrt.has( 'depth' ) ) {

				depthNode = mrt.get( 'depth' );

			} else if ( renderer.logarithmicDepthBuffer === true ) {

				if ( camera.isPerspectiveCamera ) {

					depthNode = viewZToLogarithmicDepth( positionView.z, cameraNear, cameraFar );

				} else {

					depthNode = viewZToOrthographicDepth( positionView.z, cameraNear, cameraFar );

				}

			}

		}

		if ( depthNode !== null ) {

			depth.assign( depthNode ).append();

		}

	}

	setupPosition( builder ) {

		const { object } = builder;
		const geometry = object.geometry;

		builder.addStack();

		// Vertex

		if ( geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color ) {

			morphReference( object ).append();

		}

		if ( object.isSkinnedMesh === true ) {

			skinningReference( object ).append();

		}

		if ( this.displacementMap ) {

			const displacementMap = materialReference( 'displacementMap', 'texture' );
			const displacementScale = materialReference( 'displacementScale', 'float' );
			const displacementBias = materialReference( 'displacementBias', 'float' );

			positionLocal.addAssign( normalLocal.normalize().mul( ( displacementMap.x.mul( displacementScale ).add( displacementBias ) ) ) );

		}

		if ( object.isBatchedMesh ) {

			batch( object ).append();

		}

		if ( ( object.isInstancedMesh && object.instanceMatrix && object.instanceMatrix.isInstancedBufferAttribute === true ) ) {

			instancedMesh( object ).append();

		}

		if ( this.positionNode !== null ) {

			positionLocal.assign( this.positionNode );

		}

		this.setupHardwareClipping( builder );

		const mvp = modelViewProjection();

		builder.context.vertex = builder.removeStack();
		builder.context.mvp = mvp;

		return mvp;

	}

	setupDiffuseColor( { object, geometry } ) {

		let colorNode = this.colorNode ? vec4( this.colorNode ) : materialColor;

		// VERTEX COLORS

		if ( this.vertexColors === true && geometry.hasAttribute( 'color' ) ) {

			colorNode = vec4( colorNode.xyz.mul( attribute( 'color', 'vec3' ) ), colorNode.a );

		}

		// Instanced colors

		if ( object.instanceColor ) {

			const instanceColor = varyingProperty( 'vec3', 'vInstanceColor' );

			colorNode = instanceColor.mul( colorNode );

		}

		if ( object.isBatchedMesh && object._colorsTexture ) {

			const batchColor = varyingProperty( 'vec3', 'vBatchColor' );

			colorNode = batchColor.mul( colorNode );

		}


		// COLOR

		diffuseColor.assign( colorNode );

		// OPACITY

		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;
		diffuseColor.a.assign( diffuseColor.a.mul( opacityNode ) );

		// ALPHA TEST

		if ( this.alphaTestNode !== null || this.alphaTest > 0 ) {

			const alphaTestNode = this.alphaTestNode !== null ? float( this.alphaTestNode ) : materialAlphaTest;

			diffuseColor.a.lessThanEqual( alphaTestNode ).discard();

		}

		// ALPHA HASH

		if ( this.alphaHash === true ) {

			diffuseColor.a.lessThan( getAlphaHashThreshold( positionLocal ) ).discard();

		}

		if ( this.transparent === false && this.blending === NormalBlending && this.alphaToCoverage === false ) {

			diffuseColor.a.assign( 1.0 );

		}

	}

	setupVariants( /*builder*/ ) {

		// Interface function.

	}

	setupOutgoingLight() {

		return ( this.lights === true ) ? vec3( 0 ) : diffuseColor.rgb;

	}

	setupNormal() {

		return this.normalNode ? vec3( this.normalNode ) : materialNormal;

	}

	setupEnvironment( /*builder*/ ) {

		let node = null;

		if ( this.envNode ) {

			node = this.envNode;

		} else if ( this.envMap ) {

			node = this.envMap.isCubeTexture ? materialReference( 'envMap', 'cubeTexture' ) : materialReference( 'envMap', 'texture' );

		}

		return node;

	}

	setupLightMap( builder ) {

		let node = null;

		if ( builder.material.lightMap ) {

			node = new IrradianceNode( materialLightMap );

		}

		return node;

	}

	setupLights( builder ) {

		const materialLightsNode = [];

		//

		const envNode = this.setupEnvironment( builder );

		if ( envNode && envNode.isLightingNode ) {

			materialLightsNode.push( envNode );

		}

		const lightMapNode = this.setupLightMap( builder );

		if ( lightMapNode && lightMapNode.isLightingNode ) {

			materialLightsNode.push( lightMapNode );

		}

		if ( this.aoNode !== null || builder.material.aoMap ) {

			const aoNode = this.aoNode !== null ? this.aoNode : materialAOMap;

			materialLightsNode.push( new AONode( aoNode ) );

		}

		let lightsN = this.lightsNode || builder.lightsNode;

		if ( materialLightsNode.length > 0 ) {

			lightsN = builder.renderer.lighting.createNode( [ ...lightsN.getLights(), ...materialLightsNode ] );

		}

		return lightsN;

	}

	setupLightingModel( /*builder*/ ) {

		// Interface function.

	}

	setupLighting( builder ) {

		const { material } = builder;
		const { backdropNode, backdropAlphaNode, emissiveNode } = this;

		// OUTGOING LIGHT

		const lights = this.lights === true || this.lightsNode !== null;

		const lightsNode = lights ? this.setupLights( builder ) : null;

		let outgoingLightNode = this.setupOutgoingLight( builder );

		if ( lightsNode && lightsNode.getScope().hasLights ) {

			const lightingModel = this.setupLightingModel( builder );

			outgoingLightNode = lightingContext( lightsNode, lightingModel, backdropNode, backdropAlphaNode );

		} else if ( backdropNode !== null ) {

			outgoingLightNode = vec3( backdropAlphaNode !== null ? mix( outgoingLightNode, backdropNode, backdropAlphaNode ) : backdropNode );

		}

		// EMISSIVE

		if ( ( emissiveNode && emissiveNode.isNode === true ) || ( material.emissive && material.emissive.isColor === true ) ) {

			emissive.assign( vec3( emissiveNode ? emissiveNode : materialEmissive ) );

			outgoingLightNode = outgoingLightNode.add( emissive );

		}

		return outgoingLightNode;

	}

	setupOutput( builder, outputNode ) {

		// FOG

		if ( this.fog === true ) {

			const fogNode = builder.fogNode;

			if ( fogNode ) outputNode = vec4( fogNode.mix( outputNode.rgb, fogNode.colorNode ), outputNode.a );

		}

		return outputNode;

	}

	setDefaultValues( material ) {

		// This approach is to reuse the native refreshUniforms*
		// and turn available the use of features like transmission and environment in core

		for ( const property in material ) {

			const value = material[ property ];

			if ( this[ property ] === undefined ) {

				this[ property ] = value;

				if ( value && value.clone ) this[ property ] = value.clone();

			}

		}

		const descriptors = Object.getOwnPropertyDescriptors( material.constructor.prototype );

		for ( const key in descriptors ) {

			if ( Object.getOwnPropertyDescriptor( this.constructor.prototype, key ) === undefined &&
			     descriptors[ key ].get !== undefined ) {

				Object.defineProperty( this.constructor.prototype, key, descriptors[ key ] );

			}

		}

	}

	toJSON( meta ) {

		const isRoot = ( meta === undefined || typeof meta === 'string' );

		if ( isRoot ) {

			meta = {
				textures: {},
				images: {},
				nodes: {}
			};

		}

		const data = Material.prototype.toJSON.call( this, meta );
		const nodeChildren = getNodeChildren( this );

		data.inputNodes = {};

		for ( const { property, childNode } of nodeChildren ) {

			data.inputNodes[ property ] = childNode.toJSON( meta ).uuid;

		}

		// TODO: Copied from Object3D.toJSON

		function extractFromCache( cache ) {

			const values = [];

			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

		if ( isRoot ) {

			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );
			const nodes = extractFromCache( meta.nodes );

			if ( textures.length > 0 ) data.textures = textures;
			if ( images.length > 0 ) data.images = images;
			if ( nodes.length > 0 ) data.nodes = nodes;

		}

		return data;

	}

	copy( source ) {

		this.lightsNode = source.lightsNode;
		this.envNode = source.envNode;

		this.colorNode = source.colorNode;
		this.normalNode = source.normalNode;
		this.opacityNode = source.opacityNode;
		this.backdropNode = source.backdropNode;
		this.backdropAlphaNode = source.backdropAlphaNode;
		this.alphaTestNode = source.alphaTestNode;

		this.positionNode = source.positionNode;
		this.geometryNode = source.geometryNode;

		this.depthNode = source.depthNode;
		this.shadowPositionNode = source.shadowPositionNode;
		this.receivedShadowNode = source.receivedShadowNode;
		this.castShadowNode = source.castShadowNode;

		this.outputNode = source.outputNode;
		this.mrtNode = source.mrtNode;

		this.fragmentNode = source.fragmentNode;
		this.vertexNode = source.vertexNode;

		return super.copy( source );

	}

}

export default NodeMaterial;
