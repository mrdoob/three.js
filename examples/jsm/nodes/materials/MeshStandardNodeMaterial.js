import NodeMaterial from './NodeMaterial.js';
import {
	float, vec3, vec4, normalView, add, context,
	assign, label, mul, invert, mix, texture, uniform,
	materialRoughness, materialMetalness, materialEmissive
} from '../shadernode/ShaderNodeElements.js';
import LightsNode from '../lighting/LightsNode.js';
import EnvironmentNode from '../lighting/EnvironmentNode.js';
import AONode from '../lighting/AONode.js';
import getRoughness from '../functions/material/getRoughness.js';
import PhysicalLightingModel from '../functions/PhysicalLightingModel.js';
import NormalMapNode from '../display/NormalMapNode.js';

import { MeshStandardMaterial } from 'three';

const defaultValues = new MeshStandardMaterial();

export default class MeshStandardNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshStandardNodeMaterial = true;

		this.colorNode = null;
		this.opacityNode = null;

		this.alphaTestNode = null;

		this.normalNode = null;

		this.emissiveNode = null;

		this.metalnessNode = null;
		this.roughnessNode = null;

		this.clearcoatNode = null;
		this.clearcoatRoughnessNode = null;

		this.envNode = null;

		this.lightsNode = null;

		this.positionNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	build( builder ) {

		this.generatePosition( builder );

		const colorNodes = this.generateDiffuseColor( builder );
		const { colorNode } = colorNodes;
		let { diffuseColorNode } = colorNodes;

		const envNode = this.envNode || builder.scene.environmentNode;

		diffuseColorNode = this.generateStandardMaterial( builder, { colorNode, diffuseColorNode } );

		if ( this.lightsNode ) builder.lightsNode = this.lightsNode;

		const materialLightsNode = [];

		if ( envNode ) {

			materialLightsNode.push( new EnvironmentNode( envNode ) );

		}

		if ( builder.material.aoMap ) {

			materialLightsNode.push( new AONode( texture( builder.material.aoMap ) ) );

		}

		if ( materialLightsNode.length > 0 ) {

			builder.lightsNode = new LightsNode( [ ...builder.lightsNode.lightNodes, ...materialLightsNode ] );

		}

		const outgoingLightNode = this.generateLight( builder, { diffuseColorNode, lightingModelNode: PhysicalLightingModel } );

		this.generateOutput( builder, { diffuseColorNode, outgoingLightNode } );

	}

	generateStandardMaterial( builder, { colorNode, diffuseColorNode } ) {

		const { material } = builder;

		// METALNESS

		let metalnessNode = this.metalnessNode ? float( this.metalnessNode ) : materialMetalness;

		metalnessNode = builder.addFlow( 'fragment', label( metalnessNode, 'Metalness' ) );
		builder.addFlow( 'fragment', assign( diffuseColorNode, vec4( mul( diffuseColorNode.rgb, invert( metalnessNode ) ), diffuseColorNode.a ) ) );

		// ROUGHNESS

		let roughnessNode = this.roughnessNode ? float( this.roughnessNode ) : materialRoughness;
		roughnessNode = getRoughness.call( { roughness: roughnessNode } );

		builder.addFlow( 'fragment', label( roughnessNode, 'Roughness' ) );

		// SPECULAR COLOR

		const specularColorNode = mix( vec3( 0.04 ), colorNode.rgb, metalnessNode );

		builder.addFlow( 'fragment', label( specularColorNode, 'SpecularColor' ) );

		// NORMAL VIEW

		const normalNode = this.normalNode ? vec3( this.normalNode ) : ( material.normalMap ? new NormalMapNode( texture( material.normalMap ), uniform( material.normalScale ) ) : normalView );

		builder.addFlow( 'fragment', label( normalNode, 'TransformedNormalView' ) );

		return diffuseColorNode;

	}

	generateLight( builder, { diffuseColorNode, lightingModelNode, lightsNode = builder.lightsNode } ) {

		const renderer = builder.renderer;

		// OUTGOING LIGHT

		let outgoingLightNode = super.generateLight( builder, { diffuseColorNode, lightingModelNode, lightsNode } );

		// EMISSIVE

		outgoingLightNode = add( vec3( this.emissiveNode || materialEmissive ), outgoingLightNode );

		// TONE MAPPING

		if ( renderer.toneMappingNode ) outgoingLightNode = context( renderer.toneMappingNode, { color: outgoingLightNode } );

		return outgoingLightNode;

	}

	copy( source ) {

		this.colorNode = source.colorNode;
		this.opacityNode = source.opacityNode;

		this.alphaTestNode = source.alphaTestNode;

		this.normalNode = source.normalNode;

		this.emissiveNode = source.emissiveNode;

		this.metalnessNode = source.metalnessNode;
		this.roughnessNode = source.roughnessNode;

		this.clearcoatNode = source.clearcoatNode;
		this.clearcoatRoughnessNode = source.clearcoatRoughnessNode;

		this.envNode = source.envNode;

		this.lightsNode = source.lightsNode;

		this.positionNode = source.positionNode;

		return super.copy( source );

	}

}
