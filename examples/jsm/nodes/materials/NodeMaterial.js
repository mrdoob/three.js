import { Material, ShaderMaterial } from 'three';
import { getNodesKeys, getCacheKey } from '../core/NodeUtils.js';
import ExpressionNode from '../core/ExpressionNode.js';
import {
	float, vec3, vec4,
	assign, label, mul, bypass, attribute,
	positionLocal, skinning, instance, modelViewProjection, lightingContext, colorSpace,
	materialAlphaTest, materialColor, materialOpacity
} from '../shadernode/ShaderNodeElements.js';

class NodeMaterial extends ShaderMaterial {

	constructor() {

		super();

		this.isNodeMaterial = true;

		this.type = this.constructor.name;

		this.lights = true;

	}

	build( builder ) {

		this.generatePosition( builder );

		const { lightsNode } = this;
		const { diffuseColorNode } = this.generateDiffuseColor( builder );

		const outgoingLightNode = this.generateLight( builder, { diffuseColorNode, lightsNode } );

		this.generateOutput( builder, { diffuseColorNode, outgoingLightNode } );

	}

	customProgramCacheKey() {

		return getCacheKey( this );

	}

	generatePosition( builder ) {

		const object = builder.object;

		// < VERTEX STAGE >

		let vertex = positionLocal;

		if ( this.positionNode !== null ) {

			vertex = bypass( vertex, assign( positionLocal, this.positionNode ) );

		}

		if ( object.instanceMatrix?.isInstancedBufferAttribute === true && builder.isAvailable( 'instance' ) === true ) {

			vertex = bypass( vertex, instance( object ) );

		}

		if ( object.isSkinnedMesh === true ) {

			vertex = bypass( vertex, skinning( object ) );

		}

		builder.context.vertex = vertex;

		builder.addFlow( 'vertex', modelViewProjection() );

	}

	generateDiffuseColor( builder ) {

		// < FRAGMENT STAGE >

		let colorNode = vec4( this.colorNode || materialColor );
		let opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;

		// VERTEX COLORS

		if ( this.vertexColors === true && builder.geometry.hasAttribute( 'color' ) ) {

			colorNode = vec4( mul( colorNode.xyz, attribute( 'color' ) ), colorNode.a );
		
		}

		// COLOR

		colorNode = builder.addFlow( 'fragment', label( colorNode, 'Color' ) );
		const diffuseColorNode = builder.addFlow( 'fragment', label( colorNode, 'DiffuseColor' ) );

		// OPACITY

		opacityNode = builder.addFlow( 'fragment', label( opacityNode, 'OPACITY' ) );
		builder.addFlow( 'fragment', assign( diffuseColorNode.a, mul( diffuseColorNode.a, opacityNode ) ) );

		// ALPHA TEST

		if ( this.alphaTestNode || this.alphaTest > 0 ) {

			const alphaTestNode = this.alphaTestNode ? float( this.alphaTestNode ) : materialAlphaTest;

			builder.addFlow( 'fragment', label( alphaTestNode, 'AlphaTest' ) );

			// @TODO: remove ExpressionNode here and then possibly remove it completely
			builder.addFlow( 'fragment', new ExpressionNode( 'if ( DiffuseColor.a <= AlphaTest ) { discard; }' ) );

		}

		return { colorNode, diffuseColorNode };

	}

	generateLight( builder, { diffuseColorNode, lightingModelNode, lightsNode = builder.lightsNode } ) {

		// < ANALYTIC LIGHTS >

		// OUTGOING LIGHT

		let outgoingLightNode = diffuseColorNode.xyz;
		if ( lightsNode && lightsNode.hasLight !== false ) outgoingLightNode = builder.addFlow( 'fragment', label( lightingContext( lightsNode, lightingModelNode ), 'Light' ) );

		return outgoingLightNode;

	}

	generateOutput( builder, { diffuseColorNode, outgoingLightNode } ) {

		// OUTPUT

		let outputNode = vec4( outgoingLightNode, diffuseColorNode.a );

		// ENCODING

		outputNode = colorSpace( outputNode, builder.renderer.outputEncoding );

		// FOG

		if ( builder.fogNode ) outputNode = vec4( vec3( builder.fogNode.mix( outputNode ) ), outputNode.w );

		// RESULT

		builder.addFlow( 'fragment', label( outputNode, 'Output' ) );

		return outputNode;

	}

	setDefaultValues( values ) {

		// This approach is to reuse the native refreshUniforms*
		// and turn available the use of features like transmission and environment in core

		for ( const property in values ) {

			const value = values[ property ];

			if ( this[ property ] === undefined ) {

				this[ property ] = value?.clone?.() || value;

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
