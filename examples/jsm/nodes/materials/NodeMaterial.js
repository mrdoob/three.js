import { Material, ShaderMaterial, NoColorSpace, LinearSRGBColorSpace } from 'three';
import { getNodeChildren, getCacheKey } from '../core/NodeUtils.js';
import { attribute } from '../core/AttributeNode.js';
import { output, diffuseColor } from '../core/PropertyNode.js';
import { materialNormal } from '../accessors/ExtendedMaterialNode.js';
import { materialAlphaTest, materialColor, materialOpacity, materialEmissive } from '../accessors/MaterialNode.js';
import { modelViewProjection } from '../accessors/ModelViewProjectionNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { instance } from '../accessors/InstanceNode.js';
import { positionLocal, positionView } from '../accessors/PositionNode.js';
import { skinning } from '../accessors/SkinningNode.js';
import { morph } from '../accessors/MorphNode.js';
import { texture } from '../accessors/TextureNode.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import { lightsWithoutWrap } from '../lighting/LightsNode.js';
import { mix, dFdx, dFdy } from '../math/MathNode.js';
import { float, vec3, vec4 } from '../shadernode/ShaderNode.js';
import AONode from '../lighting/AONode.js';
import { lightingContext } from '../lighting/LightingContextNode.js';
import EnvironmentNode from '../lighting/EnvironmentNode.js';

const NodeMaterials = new Map();

class NodeMaterial extends ShaderMaterial {

	constructor() {

		super();

		this.isNodeMaterial = true;

		this.type = this.constructor.name;

		this.forceSinglePass = false;

		this.unlit = this.constructor === NodeMaterial.prototype.constructor; // Extended materials are not unlit by default

		this.fog = true;
		this.lights = true;
		this.normals = true;
		this.colorSpace = true;

		this.lightsNode = null;
		this.envNode = null;

		this.colorNode = null;
		this.normalNode = null;
		this.opacityNode = null;
		this.backdropNode = null;
		this.backdropAlphaNode = null;
		this.alphaTestNode = null;

		this.positionNode = null;

		this.outputNode = null; // @TODO: Rename to fragmentNode
		this.vertexNode = null;

	}

	customProgramCacheKey() {

		return this.type + getCacheKey( this );

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

		let outputNode;

		if ( this.unlit === false ) {

			if ( this.normals === true ) this.constructNormal( builder );

			this.constructDiffuseColor( builder );
			this.constructVariants( builder );

			const outgoingLightNode = this.constructLighting( builder );

			outputNode = this.constructOutput( builder, vec4( outgoingLightNode, diffuseColor.a ) );

			// OUTPUT NODE

			builder.stack.assign( output, outputNode );

			//

			if ( this.outputNode !== null ) outputNode = this.outputNode;

		} else {

			outputNode = this.constructOutput( builder, this.outputNode || vec4( 0, 0, 0, 1 ) );

		}

		builder.stack.outputNode = outputNode;

		builder.addFlow( 'fragment', builder.removeStack() );

	}

	constructPosition( builder ) {

		const object = builder.object;
		const geometry = object.geometry;

		builder.addStack();

		if ( geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color ) {

			builder.stack.add( morph( object ) );

		}

		if ( object.isSkinnedMesh === true ) {

			builder.stack.add( skinning( object ) );

		}

		if ( ( object.instanceMatrix && object.instanceMatrix.isInstancedBufferAttribute === true ) && builder.isAvailable( 'instance' ) === true ) {

			builder.stack.add( instance( object ) );

		}

		if ( this.positionNode !== null ) {

			builder.stack.assign( positionLocal, this.positionNode );

		}

		builder.context.vertex = builder.removeStack();

		return this.vertexNode || modelViewProjection();

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

		if ( this.alphaTestNode !== null || this.alphaTest > 0 ) {

			const alphaTestNode = this.alphaTestNode !== null ? float( this.alphaTestNode ) : materialAlphaTest;

			stack.add( diffuseColor.a.lessThanEqual( alphaTestNode ).discard() );

		}

	}

	constructVariants( /*builder*/ ) {

		// Interface function.

	}

	constructNormal( { stack } ) {

		// NORMAL VIEW

		if ( this.flatShading === true ) {

			const fdx = dFdx( positionView );
			const fdy = dFdy( positionView.negate() ); // use -positionView ?
			const normalNode = fdx.cross( fdy ).normalize();

			stack.assign( transformedNormalView, normalNode );

		} else {

			const normalNode = this.normalNode ? vec3( this.normalNode ) : materialNormal;

			stack.assign( transformedNormalView, normalNode );

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

		let outgoingLightNode = diffuseColor.rgb;

		if ( lightsNode && lightsNode.hasLight !== false ) {

			const lightingModelNode = this.constructLightingModel( builder );

			outgoingLightNode = lightingContext( lightsNode, lightingModelNode, backdropNode, backdropAlphaNode );

		} else if ( backdropNode !== null ) {

			outgoingLightNode = vec3( backdropAlphaNode !== null ? mix( outgoingLightNode, backdropNode, backdropAlphaNode ) : backdropNode );

		}

		// EMISSIVE

		if ( ( emissiveNode && emissiveNode.isNode === true ) || ( material.emissive && material.emissive.isColor === true ) ) {

			outgoingLightNode = outgoingLightNode.add( vec3( emissiveNode ? emissiveNode : materialEmissive ) );

		}

		return outgoingLightNode;

	}

	constructOutput( builder, outputNode ) {

		const renderer = builder.renderer;

		// TONE MAPPING

		const toneMappingNode = builder.toneMappingNode;

		if ( toneMappingNode ) {

			outputNode = vec4( toneMappingNode.context( { color: outputNode.rgb } ), outputNode.a );

		}

		// FOG

		if ( this.fog === true ) {

			const fogNode = builder.fogNode;

			if ( fogNode ) outputNode = vec4( fogNode.mixAssign( outputNode.rgb ), outputNode.a );

		}

		// ENCODING

		if ( this.colorSpace === true ) {

			const renderTarget = renderer.getRenderTarget();

			let outputColorSpace;

			if ( renderTarget !== null ) {

				if ( Array.isArray( renderTarget.texture ) ) {

					outputColorSpace = renderTarget.texture[ 0 ].colorSpace;

				} else {

					outputColorSpace = renderTarget.texture.colorSpace;

				}

			} else {

				outputColorSpace = renderer.outputColorSpace;

			}

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

		this.outputNode = source.outputNode;
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
