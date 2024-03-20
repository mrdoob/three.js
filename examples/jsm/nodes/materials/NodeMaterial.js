import { Material, ShaderMaterial, NoColorSpace, LinearSRGBColorSpace } from 'three';
import { getNodeChildren, getCacheKey } from '../core/NodeUtils.js';
import { attribute } from '../core/AttributeNode.js';
import { output, diffuseColor, varyingProperty } from '../core/PropertyNode.js';
import { materialAlphaTest, materialColor, materialOpacity, materialEmissive, materialNormal } from '../accessors/MaterialNode.js';
import { modelViewProjection } from '../accessors/ModelViewProjectionNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { instance } from '../accessors/InstanceNode.js';
import { batch } from '../accessors/BatchNode.js';

import { positionLocal, positionView } from '../accessors/PositionNode.js';
import { skinningReference } from '../accessors/SkinningNode.js';
import { morphReference } from '../accessors/MorphNode.js';
import { texture } from '../accessors/TextureNode.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import { lightsNode } from '../lighting/LightsNode.js';
import { mix } from '../math/MathNode.js';
import { float, vec3, vec4 } from '../shadernode/ShaderNode.js';
import AONode from '../lighting/AONode.js';
import { lightingContext } from '../lighting/LightingContextNode.js';
import EnvironmentNode from '../lighting/EnvironmentNode.js';
import { depthPixel } from '../display/ViewportDepthNode.js';
import { cameraLogDepth } from '../accessors/CameraNode.js';
import { clipping, clippingAlpha } from '../accessors/ClippingNode.js';
import { faceDirection } from '../display/FrontFacingNode.js';

const NodeMaterials = new Map();

class NodeMaterial extends ShaderMaterial {

	constructor() {

		super();

		this.isNodeMaterial = true;

		this.type = this.constructor.type;

		this.forceSinglePass = false;

		this.fog = true;
		this.lights = true;
		this.normals = true;

		this.colorSpaced = true;

		this.lightsNode = null;
		this.envNode = null;

		this.colorNode = null;
		this.normalNode = null;
		this.opacityNode = null;
		this.backdropNode = null;
		this.backdropAlphaNode = null;
		this.alphaTestNode = null;

		this.positionNode = null;

		this.depthNode = null;
		this.shadowNode = null;

		this.outputNode = null;

		this.fragmentNode = null;
		this.vertexNode = null;

	}

	customProgramCacheKey() {

		return this.type + getCacheKey( this );

	}

	build( builder ) {

		this.setup( builder );

	}

	setup( builder ) {

		// < VERTEX STAGE >

		builder.addStack();

		builder.stack.outputNode = this.vertexNode || this.setupPosition( builder );

		builder.addFlow( 'vertex', builder.removeStack() );

		// < FRAGMENT STAGE >

		builder.addStack();

		let resultNode;

		const clippingNode = this.setupClipping( builder );

		if ( this.fragmentNode === null ) {

			if ( this.depthWrite === true ) this.setupDepth( builder );

			if ( this.normals === true ) this.setupNormal( builder );

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

		} else {

			resultNode = this.setupOutput( builder, this.fragmentNode );

		}

		builder.stack.outputNode = resultNode;

		builder.addFlow( 'fragment', builder.removeStack() );

	}

	setupClipping( builder ) {

		const { globalClippingCount, localClippingCount } = builder.clippingContext;

		let result = null;

		if ( globalClippingCount || localClippingCount ) {

			if ( this.alphaToCoverage ) {

				// to be added to flow when the color/alpha value has been determined
				result = clippingAlpha();

			} else {

				builder.stack.add( clipping() );

			}

		}

		return result;

	}

	setupDepth( builder ) {

		const { renderer } = builder;

		// Depth

		let depthNode = this.depthNode;

		if ( depthNode === null && renderer.logarithmicDepthBuffer === true ) {

			const fragDepth = modelViewProjection().w.add( 1 );

			depthNode = fragDepth.log2().mul( cameraLogDepth ).mul( 0.5 );

		}

		if ( depthNode !== null ) {

			depthPixel.assign( depthNode ).append();

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

		if ( object.isBatchedMesh ) {

			batch( object ).append();

		}

		if ( ( object.instanceMatrix && object.instanceMatrix.isInstancedBufferAttribute === true ) && builder.isAvailable( 'instance' ) === true ) {

			instance( object ).append();

		}

		if ( this.positionNode !== null ) {

			positionLocal.assign( this.positionNode );

		}

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

	}

	setupVariants( /*builder*/ ) {

		// Interface function.

	}

	setupNormal() {

		// NORMAL VIEW

		if ( this.flatShading === true ) {

			const normalNode = positionView.dFdx().cross( positionView.dFdy() ).normalize();

			transformedNormalView.assign( normalNode.mul( faceDirection ) );

		} else {

			const normalNode = this.normalNode ? vec3( this.normalNode ) : materialNormal;

			transformedNormalView.assign( normalNode.mul( faceDirection ) );

		}

	}

	getEnvNode( builder ) {

		let node = null;

		if ( this.envNode ) {

			node = this.envNode;

		} else if ( this.envMap ) {

			node = this.envMap.isCubeTexture ? cubeTexture( this.envMap ) : texture( this.envMap );

		} else if ( builder.environmentNode ) {

			node = builder.environmentNode;

		}

		return node;

	}

	setupLights( builder ) {

		const envNode = this.getEnvNode( builder );

		//

		const materialLightsNode = [];

		if ( envNode ) {

			materialLightsNode.push( new EnvironmentNode( envNode ) );

		}

		if ( builder.material.aoMap ) {

			materialLightsNode.push( new AONode( texture( builder.material.aoMap ) ) );

		}

		let lightsN = this.lightsNode || builder.lightsNode;

		if ( materialLightsNode.length > 0 ) {

			lightsN = lightsNode( [ ...lightsN.lightNodes, ...materialLightsNode ] );

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

		let outgoingLightNode = diffuseColor.rgb;

		if ( lightsNode && lightsNode.hasLight !== false ) {

			const lightingModel = this.setupLightingModel( builder );

			outgoingLightNode = lightingContext( lightsNode, lightingModel, backdropNode, backdropAlphaNode );

		} else if ( backdropNode !== null ) {

			outgoingLightNode = vec3( backdropAlphaNode !== null ? mix( outgoingLightNode, backdropNode, backdropAlphaNode ) : backdropNode );

		}

		// EMISSIVE

		if ( ( emissiveNode && emissiveNode.isNode === true ) || ( material.emissive && material.emissive.isColor === true ) ) {

			outgoingLightNode = outgoingLightNode.add( vec3( emissiveNode ? emissiveNode : materialEmissive ) );

		}

		return outgoingLightNode;

	}

	setupOutput( builder, outputNode ) {

		const renderer = builder.renderer;

		// FOG

		if ( this.fog === true ) {

			const fogNode = builder.fogNode;

			if ( fogNode ) outputNode = vec4( fogNode.mix( outputNode.rgb, fogNode.colorNode ), outputNode.a );

		}

		// TONE MAPPING

		const toneMappingNode = builder.toneMappingNode;

		if ( this.toneMapped === true && toneMappingNode ) {

			outputNode = vec4( toneMappingNode.context( { color: outputNode.rgb } ), outputNode.a );

		}

		// ENCODING

		if ( this.colorSpaced === true ) {

			const outputColorSpace = renderer.currentColorSpace;

			if ( outputColorSpace !== LinearSRGBColorSpace && outputColorSpace !== NoColorSpace ) {

				outputNode = outputNode.linearToColorSpace( outputColorSpace );

			}

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

		Object.assign( this.defines, material.defines );

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

		this.depthNode = source.depthNode;
		this.shadowNode = source.shadowNode;

		this.outputNode = source.outputNode;

		this.fragmentNode = source.fragmentNode;
		this.vertexNode = source.vertexNode;

		return super.copy( source );

	}

	static fromMaterial( material ) {

		if ( material.isNodeMaterial === true ) { // is already a node material

			return material;

		}

		const type = material.type.replace( 'Material', 'NodeMaterial' );

		const nodeMaterial = createNodeMaterialFromType( type );

		if ( nodeMaterial === undefined ) {

			throw new Error( `NodeMaterial: Material "${ material.type }" is not compatible.` );

		}

		for ( const key in material ) {

			nodeMaterial[ key ] = material[ key ];

		}

		return nodeMaterial;

	}

}

export default NodeMaterial;

export function addNodeMaterial( type, nodeMaterial ) {

	if ( typeof nodeMaterial !== 'function' || ! type ) throw new Error( `Node material ${ type } is not a class` );
	if ( NodeMaterials.has( type ) ) {

		console.warn( `Redefinition of node material ${ type }` );
		return;

	}

	NodeMaterials.set( type, nodeMaterial );
	nodeMaterial.type = type;

}

export function createNodeMaterialFromType( type ) {

	const Material = NodeMaterials.get( type );

	if ( Material !== undefined ) {

		return new Material();

	}

}

addNodeMaterial( 'NodeMaterial', NodeMaterial );
