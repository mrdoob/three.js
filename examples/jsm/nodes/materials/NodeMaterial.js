import { Material, ShaderMaterial, NoToneMapping } from 'three';
import { getNodesKeys, getCacheKey } from '../core/NodeUtils.js';
import StackNode from '../core/StackNode.js';
import LightsNode from '../lighting/LightsNode.js';
import EnvironmentNode from '../lighting/EnvironmentNode.js';
import ToneMappingNode from '../display/ToneMappingNode.js';
import AONode from '../lighting/AONode.js';
import {
	float, vec3, vec4,
	assign, mul, bypass, attribute, context, texture, lessThanEqual, discard,
	positionLocal, diffuseColor, skinning, instance, modelViewProjection, lightingContext, colorSpace,
	materialAlphaTest, materialColor, materialOpacity, materialEmissive, materialNormal, transformedNormalView,
	reference, rangeFog, densityFog
} from '../shadernode/ShaderNodeElements.js';

class NodeMaterial extends ShaderMaterial {

	constructor() {

		super();

		this.isNodeMaterial = true;

		this.type = this.constructor.name;

		this.lights = true;
		this.normals = true;

		this.lightsNode = null;

	}

	customProgramCacheKey() {

		return getCacheKey( this );

	}

	build( builder ) {

		this.construct( builder );

	}

	construct( builder ) {

		// < STACKS >

		const vertexStack = new StackNode();
		const fragmentStack = new StackNode();

		// < VERTEX STAGE >

		vertexStack.outputNode = this.constructPosition( builder, vertexStack );

		// < FRAGMENT STAGE >

		if ( this.normals === true ) this.constructNormal( builder, fragmentStack );

		this.constructDiffuseColor( builder, fragmentStack );
		this.constructVariants( builder, fragmentStack );

		const outgoingLightNode = this.constructLighting( builder, fragmentStack );

		fragmentStack.outputNode = this.constructOutput( builder, fragmentStack, outgoingLightNode, diffuseColor.a );

		// < FLOW >

		builder.addFlow( 'vertex', vertexStack );
		builder.addFlow( 'fragment', fragmentStack );

	}

	constructPosition( builder ) {

		const object = builder.object;

		let vertex = positionLocal;

		if ( this.positionNode !== null ) {

			vertex = bypass( vertex, assign( positionLocal, this.positionNode ) );

		}

		if ( ( object.instanceMatrix && object.instanceMatrix.isInstancedBufferAttribute === true ) && builder.isAvailable( 'instance' ) === true ) {

			vertex = bypass( vertex, instance( object ) );

		}

		if ( object.isSkinnedMesh === true ) {

			vertex = bypass( vertex, skinning( object ) );

		}

		builder.context.vertex = vertex;

		return modelViewProjection();

	}

	constructDiffuseColor( builder, stack ) {

		let colorNode = vec4( this.colorNode || materialColor );
		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;

		// VERTEX COLORS

		if ( this.vertexColors === true && builder.geometry.hasAttribute( 'color' ) ) {

			colorNode = vec4( mul( colorNode.xyz, attribute( 'color' ) ), colorNode.a );

		}

		// COLOR

		stack.assign( diffuseColor, colorNode );

		// OPACITY

		stack.assign( diffuseColor.a, diffuseColor.a.mul( opacityNode ) );

		// ALPHA TEST

		if ( this.alphaTestNode || this.alphaTest > 0 ) {

			const alphaTestNode = this.alphaTestNode ? float( this.alphaTestNode ) : materialAlphaTest;

			stack.add( discard( lessThanEqual( diffuseColor.a, alphaTestNode ) ) );

		}

	}

	constructVariants( /*builder*/ ) {

		// Interface function.

	}

	constructNormal( builder, stack ) {

		// NORMAL VIEW

		const normalNode = this.normalNode ? vec3( this.normalNode ) : materialNormal;

		stack.assign( transformedNormalView, normalNode );

		return normalNode;

	}

	constructLights( builder ) {

		let lightsNode = this.lightsNode || builder.lightsNode;

		const envNode = this.envNode || builder.scene.environmentNode;
		const materialLightsNode = [];

		if ( envNode ) {

			materialLightsNode.push( new EnvironmentNode( envNode ) );

		}

		if ( builder.material.aoMap ) {

			materialLightsNode.push( new AONode( texture( builder.material.aoMap ) ) );

		}

		if ( materialLightsNode.length > 0 ) {

			lightsNode = new LightsNode( [ ...lightsNode.lightNodes, ...materialLightsNode ] );

		}

		return lightsNode;

	}

	constructLightingModel( /*builder*/ ) {

		// Interface function.

	}

	constructLighting( builder ) {

		const { material } = builder;

		// OUTGOING LIGHT

		const lights = ( this.lights === true ) || this.lightsNode !== null;

		const lightsNode = lights ? this.constructLights( builder ) : null;
		const lightingModelNode = lightsNode ? this.constructLightingModel( builder ) : null;

		let outgoingLightNode = diffuseColor.xyz;

		if ( lightsNode && lightsNode.hasLight !== false ) {

			outgoingLightNode = lightingContext( lightsNode, lightingModelNode );

		}

		// EMISSIVE

		if ( ( this.emissiveNode && this.emissiveNode.isNode === true ) || ( material.emissive && material.emissive.isColor === true ) ) {

			outgoingLightNode = outgoingLightNode.add( vec3( this.emissiveNode || materialEmissive ) );

		}

		return outgoingLightNode;

	}

	constructOutput( builder, stack, outgoingLight, opacity ) {

		const renderer = builder.renderer;

		// TONE MAPPING

		let toneMappingNode = renderer.toneMappingNode;

		if ( ! toneMappingNode && renderer.toneMapping !== NoToneMapping ) {

			toneMappingNode = new ToneMappingNode( renderer.toneMapping, reference( 'toneMappingExposure', 'float', renderer ), outgoingLight );

		}

		if ( toneMappingNode && toneMappingNode.isNode === true ) {

			outgoingLight = context( toneMappingNode, { color: outgoingLight } );

		}

		// @TODO: Optimize outputNode to vec3.

		let outputNode = vec4( outgoingLight, opacity );

		// ENCODING

		outputNode = colorSpace( outputNode, renderer.outputEncoding );

		// FOG

		let fogNode = builder.fogNode;

		if ( ( fogNode && fogNode.isNode !== true ) && builder.scene.fog ) {

			const fog = builder.scene.fog;

			if ( fog.isFogExp2 ) {

				fogNode = densityFog( reference( 'color', 'color', fog ), reference( 'density', 'float', fog ) );

			} else if ( fog.isFog ) {

				fogNode = rangeFog( reference( 'color', 'color', fog ), reference( 'near', 'float', fog ), reference( 'far', 'float', fog ) );

			} else {

				console.error( 'NodeMaterial: Unsupported fog configuration.', fog );

			}

		}

		if ( fogNode ) outputNode = vec4( vec3( fogNode.mix( outputNode ) ), outputNode.w );

		return outputNode;

	}

	setDefaultValues( values ) {

		// This approach is to reuse the native refreshUniforms*
		// and turn available the use of features like transmission and environment in core

		for ( const property in values ) {

			const value = values[ property ];

			if ( this[ property ] === undefined ) {

				this[ property ] = value;

				if ( value && value.clone ) this[ property ] = value.clone();

			}

		}

		Object.assign( this.defines, values.defines );

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
		const nodeKeys = getNodesKeys( this );

		data.inputNodes = {};

		for ( const name of nodeKeys ) {

			data.inputNodes[ name ] = this[ name ].toJSON( meta ).uuid;

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

	static fromMaterial( /*material*/ ) { }

}

export default NodeMaterial;
