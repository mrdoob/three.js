import { Material, ShaderMaterial } from 'three';
import { getNodesKeys } from '../core/NodeUtils.js';
import ExpressionNode from '../core/ExpressionNode.js';
import {
	float, vec3, vec4,
	assign, label, mul, add, mix, bypass,
	positionLocal, skinning, instance, modelViewProjection, lightContext, colorSpace,
	materialAlphaTest, materialColor, materialOpacity
} from '../shadernode/ShaderNodeElements.js';

class NodeMaterial extends ShaderMaterial {

	constructor() {

		super();

		this.type = this.constructor.name;

		this.lights = true;

	}

	build( builder ) {

		const { diffuseColorNode } = this.generateMain( builder );

		this.generateLight( builder, diffuseColorNode, this.lightNode );

	}

	generateMain( builder ) {

		const object = builder.object;

		// < VERTEX STAGE >

		let vertex = positionLocal;

		if ( this.positionNode !== null ) {

			vertex = bypass( vertex, assign( vertex, this.positionNode ) );

		}

		if ( object.isInstancedMesh === true && builder.isAvailable( 'instance' ) === true ) {

			vertex = bypass( vertex, instance( object ) );

		}

		if ( object.isSkinnedMesh === true ) {

			vertex = bypass( vertex, skinning( object ) );

		}

		builder.context.vertex = vertex;

		builder.addFlow( 'vertex', modelViewProjection() );

		// < FRAGMENT STAGE >

		let colorNode = vec4( this.colorNode || materialColor );
		let opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;

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

	generateLight( builder, diffuseColorNode, lightNode ) {

		// OUTGOING LIGHT

		let outgoingLightNode = diffuseColorNode.xyz;
		if ( lightNode && lightNode.hasLight !== false ) outgoingLightNode = builder.addFlow( 'fragment', label( lightContext( lightNode ), 'Light' ) );

		// EMISSIVE

		if ( this.emissiveNode ) outgoingLightNode = add( vec3( this.emissiveNode ), outgoingLightNode );

		// OUTPUT

		let outputNode = vec4( outgoingLightNode, diffuseColorNode.a );

		// ENCODING

		outputNode = colorSpace( outputNode, builder.renderer.outputEncoding );

		// FOG

		if ( builder.fogNode ) outputNode = mix( outputNode, builder.fogNode.colorNode, builder.fogNode );

		// RESULT

		builder.addFlow( 'fragment', label( outputNode, 'Output' ) );

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

	static fromMaterial( material ) { }

}

NodeMaterial.prototype.isNodeMaterial = true;

export default NodeMaterial;
