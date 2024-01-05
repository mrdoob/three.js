import { Material, ShaderMaterial, NoColorSpace, LinearSRGBColorSpace } from 'three';
import { getNodeChildren, getCacheKey } from '../core/NodeUtils.js';
import { attribute } from '../core/AttributeNode.js';
import { vertexPosition, output, position, normal, tangent, diffuseColor } from '../core/PropertyNode.js';
import { materialNormal } from '../accessors/ExtendedMaterialNode.js';
import { materialAlphaTest, materialColor, materialOpacity, materialEmissive } from '../accessors/MaterialNode.js';
import { positionGeometry, positionLocal, positionView } from '../accessors/PositionNode.js';
import { normalGeometry, transformedNormalView } from '../accessors/NormalNode.js';
import { tangentGeometry } from '../accessors/TangentNode.js';
import { modelViewProjection } from '../accessors/ModelViewProjectionNode.js';
import { instance } from '../accessors/InstanceNode.js';
import { skinning } from '../accessors/SkinningNode.js';
import { morph } from '../accessors/MorphNode.js';
import { texture } from '../accessors/TextureNode.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import { lightsWithoutWrap } from '../lighting/LightsNode.js';
import { vec4 } from '../shadernode/ShaderNode.js';
import AONode from '../lighting/AONode.js';
import EnvironmentNode from '../lighting/EnvironmentNode.js';

const NodeMaterials = new Map();

class NodeMaterial extends ShaderMaterial {

	constructor() {

		super();

		this.isNodeMaterial = true;

		this.type = this.constructor.type;

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

		this.setup( builder );

	}

	setup( builder ) {

		// < VERTEX STAGE >

		builder.addStack();

		this.setupPosition( builder );

		builder.stack.outputNode = vertexPosition;

		builder.addFlowNode( 'vertex', builder.removeStack() );

		// < FRAGMENT STAGE >

		builder.addStack();

		if ( this.normals === true ) this.setupNormal( builder );

		this.setupDiffuseColor( builder );

		if ( this.unlit === false ) {

			this.setupVariants( builder );
			this.setupLighting( builder );

		}

		this.setupOutput( builder );

		output.assign( diffuseColor ); // @TODO: do we still need `output` property?

		builder.stack.outputNode = diffuseColor;

		if ( this.outputNode !== null ) {

			builder.stack.outputNode = builder.getTypeLength( this.outputNode.getNodeType( builder ) ) === 0 ? this.outputNode : vec4( this.outputNode );

		}

		builder.addFlowNode( 'fragment', builder.removeStack() );

	}

	setupPosition( builder ) {

		const object = builder.object;
		const geometry = object.geometry;

		if ( builder.hasGeometryAttribute( 'position' ) ) position.assign( positionGeometry );
		if ( builder.hasGeometryAttribute( 'normal' ) ) normal.assign( normalGeometry );
		if ( builder.hasGeometryAttribute( 'tangent' ) ) tangent.assign( tangentGeometry );

		if ( geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color ) {

			morph( object ).append();

		}

		if ( object.isSkinnedMesh === true ) {

			skinning( object ).append();

		}

		if ( ( object.instanceMatrix && object.instanceMatrix.isInstancedBufferAttribute === true ) && builder.isAvailable( 'instance' ) === true ) {

			instance( object ).append();

		}

		if ( this.positionNode ) {

			position.assign( this.positionNode );

		}

		vertexPosition.assign( this.vertexNode || modelViewProjection() );

	}

	setupDiffuseColor( { geometry } ) {

		// COLOR

		diffuseColor.assign( this.colorNode || materialColor );

		// VERTEX COLORS

		if ( this.vertexColors === true && geometry.hasAttribute( 'color' ) ) {

			diffuseColor.rgb.mulAssign( attribute( 'color' ) );

		}

		// OPACITY

		diffuseColor.a.mulAssign( this.opacityNode || materialOpacity );

		// ALPHA TEST

		if ( this.alphaTestNode || this.alphaTest > 0 ) {

			diffuseColor.a.lessThanEqual( this.alphaTestNode || materialAlphaTest ).discard();

		}

	}

	setupVariants( /*builder*/ ) {

		// Interface function.

	}

	setupNormal() {

		// NORMAL VIEW

		let normalNode;

		if ( this.flatShading === true ) {

			const fdx = positionView.xyz.dFdx();
			const fdy = positionView.xyz.dFdy();
			normalNode = fdx.cross( fdy ).normalize();

		} else {

			normalNode = this.normalNode || materialNormal;

		}

		transformedNormalView.assign( normalNode );

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

		let lightsNode = this.lightsNode || builder.lightsNode;

		if ( materialLightsNode.length > 0 ) {

			lightsNode = lightsWithoutWrap( [ ...lightsNode.lightNodes, ...materialLightsNode ] );

		}

		return lightsNode;

	}

	setupLightingModel( /*builder*/ ) {

		// Interface function.

	}

	setupLighting( builder ) {

		const { backdropNode, backdropAlphaNode, emissiveNode } = this;

		// OUTGOING LIGHT

		const lights = this.lights === true || this.lightsNode !== null;

		const lightsNode = lights ? this.setupLights( builder ) : null;

		if ( lightsNode && lightsNode.hasLight !== false ) {

			const lightingModelNode = this.setupLightingModel( builder );

			diffuseColor.rgb = lightsNode.lightingContext( lightingModelNode, backdropNode, backdropAlphaNode );

		} else if ( backdropNode ) {

			diffuseColor.rgb = backdropAlphaNode !== null ? backdropAlphaNode.mix( diffuseColor.rgb, backdropNode ) : backdropNode;

		}

		// EMISSIVE

		if ( emissiveNode || ( builder.material.emissive && builder.material.emissive.isColor === true ) ) {

			diffuseColor.rgb.addAssign( emissiveNode || materialEmissive );

		}

	}

	setupOutput( builder ) {

		const renderer = builder.renderer;

		// TONE MAPPING

		const toneMappingNode = builder.toneMappingNode;

		if ( toneMappingNode ) {

			diffuseColor.rgb = toneMappingNode.context( { color: diffuseColor.rgb } );

		}

		// FOG

		const fogNode = builder.fogNode;

		if ( this.fog === true && fogNode ) {

			diffuseColor.rgb = fogNode.mix( diffuseColor.rgb );

		}

		// COLOR SPACE

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

			if ( outputColorSpace !== NoColorSpace ) {

				diffuseColor.linearToColorSpaceAssign( outputColorSpace );

			}

		}

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

export function addNodeMaterial( type, nodeMaterial ) {

	if ( typeof nodeMaterial !== 'function' || ! type ) throw new Error( `Node material ${ type } is not a class` );
	if ( NodeMaterials.has( type ) ) throw new Error( `Redefinition of node material ${ type }` );

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
