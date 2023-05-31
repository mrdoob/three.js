import { Material, ShaderMaterial, NoColorSpace } from 'three';
import { getNodeChildren, getCacheKey } from '../core/NodeUtils.js';
import { attribute } from '../core/AttributeNode.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { materialNormal } from '../accessors/ExtendedMaterialNode.js';
import { materialAlphaTest, materialColor, materialOpacity, materialEmissive } from '../accessors/MaterialNode.js';
import { modelViewProjection } from '../accessors/ModelViewProjectionNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { instance } from '../accessors/InstanceNode.js';
import { positionLocal } from '../accessors/PositionNode.js';
import { skinning } from '../accessors/SkinningNode.js';
import { texture } from '../accessors/TextureNode.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import { lightsWithoutWrap } from '../lighting/LightsNode.js';
import { mix } from '../math/MathNode.js';
import { float, vec3, vec4 } from '../shadernode/ShaderNode.js';
import AONode from '../lighting/AONode.js';
import EnvironmentNode from '../lighting/EnvironmentNode.js';

const NodeMaterials = new Map();

class NodeMaterial extends ShaderMaterial {

	constructor() {

		super();

		this.isNodeMaterial = true;

		this.type = this.constructor.name;

		this.lights = true;
		this.normals = true;

		this.lightsNode = null;
		this.envNode = null;

		this.colorNode = null;
		this.normalNode = null;
		this.opacityNode = null;
		this.backdropNode = null;
		this.backdropAlphaNode = null;
		this.alphaTestNode = null;

		this.positionNode = null;

	}

	customProgramCacheKey() {

		return getCacheKey( this );

	}

	build( builder ) {

		this.construct( builder );

	}

	construct( builder ) {

		// < VERTEX STAGE >

		builder.addStack();

		builder.stack.outputNode = this.constructPosition( builder );

		builder.addFlow( 'vertex', builder.removeStack() );

		// < FRAGMENT STAGE >

		builder.addStack();

		if ( this.normals === true ) this.constructNormal( builder );

		this.constructDiffuseColor( builder );
		this.constructVariants( builder );

		const outgoingLightNode = this.constructLighting( builder );

		builder.stack.outputNode = this.constructOutput( builder, outgoingLightNode, diffuseColor.a );

		builder.addFlow( 'fragment', builder.removeStack() );

	}

	constructPosition( builder ) {

		const object = builder.object;

		let vertex = positionLocal;

		if ( this.positionNode !== null ) {

			vertex = vertex.bypass( positionLocal.assign( this.positionNode ) );

		}

		if ( ( object.instanceMatrix && object.instanceMatrix.isInstancedBufferAttribute === true ) && builder.isAvailable( 'instance' ) === true ) {

			vertex = vertex.bypass( instance( object ) );

		}

		if ( object.isSkinnedMesh === true ) {

			vertex = vertex.bypass( skinning( object ) );

		}

		builder.context.vertex = vertex;

		return modelViewProjection();

	}

	constructDiffuseColor( { stack, geometry } ) {

		let colorNode = this.colorNode ? vec4( this.colorNode ) : materialColor;

		// VERTEX COLORS

		if ( this.vertexColors === true && geometry.hasAttribute( 'color' ) ) {

			colorNode = vec4( colorNode.xyz.mul( attribute( 'color' ) ), colorNode.a );

		}

		// COLOR

		stack.assign( diffuseColor, colorNode );

		// OPACITY

		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;
		stack.assign( diffuseColor.a, diffuseColor.a.mul( opacityNode ) );

		// ALPHA TEST

		if ( this.alphaTestNode || this.alphaTest > 0 ) {

			const alphaTestNode = this.alphaTestNode ? float( this.alphaTestNode ) : materialAlphaTest;

			stack.add( diffuseColor.a.lessThanEqual( alphaTestNode ).discard() );

		}

	}

	constructVariants( /*builder*/ ) {

		// Interface function.

	}

	constructNormal( { stack } ) {

		// NORMAL VIEW

		const normalNode = this.normalNode ? vec3( this.normalNode ) : materialNormal;

		stack.assign( transformedNormalView, normalNode );

		return normalNode;

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

	constructLights( builder ) {

		const envNode = this.getEnvNode( builder );

		//

		const materialLightsNode = [];

		if ( envNode ) {

			materialLightsNode.push( new EnvironmentNode( envNode ) );

		}

		if ( builder.material.aoMap ) {

			materialLightsNode.push( new AONode( texture( builder.material.aoMap ) ) );

		}

		let lightsNode = this.lightsNode || builder.lightsNode;

		if ( materialLightsNode.length > 0 ) {

			lightsNode = lightsWithoutWrap( [ ...lightsNode.lightNodes, ...materialLightsNode ] );

		}

		return lightsNode;

	}

	constructLightingModel( /*builder*/ ) {

		// Interface function.

	}

	constructLighting( builder ) {

		const { material } = builder;
		const { backdropNode, backdropAlphaNode, emissiveNode } = this;

		// OUTGOING LIGHT

		const lights = this.lights === true || this.lightsNode !== null;

		const lightsNode = lights ? this.constructLights( builder ) : null;
		const lightingModelNode = lightsNode ? this.constructLightingModel( builder ) : null;

		let outgoingLightNode = diffuseColor.rgb;

		if ( lightsNode && lightsNode.hasLight !== false ) {

			outgoingLightNode = lightsNode.lightingContext( lightingModelNode, backdropNode, backdropAlphaNode );

		} else if ( backdropNode !== null ) {

			outgoingLightNode = vec3( backdropAlphaNode !== null ? mix( outgoingLightNode, backdropNode, backdropAlphaNode ) : backdropNode );

		}

		// EMISSIVE

		if ( ( emissiveNode && emissiveNode.isNode === true ) || ( material.emissive && material.emissive.isColor === true ) ) {

			outgoingLightNode = outgoingLightNode.add( emissiveNode ? vec3( emissiveNode ) : materialEmissive );

		}

		return outgoingLightNode;

	}

	constructOutput( builder, outgoingLight, opacity ) {

		const renderer = builder.renderer;

		// TONE MAPPING

		const toneMappingNode = builder.toneMappingNode;

		if ( toneMappingNode ) {

			outgoingLight = toneMappingNode.context( { color: outgoingLight } );

		}

		// @TODO: Optimize outputNode to vec3.

		let outputNode = vec4( outgoingLight, opacity );

		// ENCODING

		const renderTarget = renderer.getRenderTarget();

		let outputColorSpace;

		if ( renderTarget !== null ) {

			outputColorSpace = renderTarget.texture.colorSpace;

		} else {

			outputColorSpace = renderer.outputColorSpace;

		}

		if ( outputColorSpace !== NoColorSpace ) outputNode = outputNode.colorSpace( outputColorSpace );

		// FOG

		const fogNode = builder.fogNode;

		if ( fogNode ) outputNode = vec4( fogNode.mixAssign( outputNode.rgb ), outputNode.a );

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

export function addNodeMaterial( nodeMaterial ) {

	if ( typeof nodeMaterial !== 'function' || ! nodeMaterial.name ) throw new Error( `Node material ${ nodeMaterial.name } is not a class` );
	if ( NodeMaterials.has( nodeMaterial.name ) ) throw new Error( `Redefinition of node material ${ nodeMaterial.name }` );

	NodeMaterials.set( nodeMaterial.name, nodeMaterial );

}

export function createNodeMaterialFromType( type ) {

	const Material = NodeMaterials.get( type );

	if ( Material !== undefined ) {

		return new Material();

	}

}

addNodeMaterial( NodeMaterial );
