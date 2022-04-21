import NodeMaterial from './NodeMaterial.js';
import {
	float, vec3, vec4,
	context, assign, label, mul, invert, mix,
	normalView,
	materialRoughness, materialMetalness
} from '../shadernode/ShaderNodeElements.js';
import getRoughness from '../functions/material/getRoughness.js';
import PhysicalLightingModel from '../functions/PhysicalLightingModel.js';

import { MeshStandardMaterial } from 'three';

const defaultValues = new MeshStandardMaterial();

export default class MeshStandardNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

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

		this.lightNode = null;

		this.positionNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	build( builder ) {

		const lightNode = this.lightNode || builder.lightNode; // use scene lights

		let { colorNode, diffuseColorNode } = this.generateMain( builder );

		diffuseColorNode = this.generateStandardMaterial( builder, { colorNode, diffuseColorNode } );

		const outgoingLightNode = this.generateLight( builder, { diffuseColorNode, lightNode } );

		this.generateOutput( builder, { diffuseColorNode, outgoingLightNode } );

	}

	generateLight( builder, { diffuseColorNode, lightNode } ) {

		let outgoingLightNode = super.generateLight( builder, { diffuseColorNode, lightNode, lightingModelNode: PhysicalLightingModel } );

		// TONE MAPPING

		const renderer = builder.renderer;

		if ( renderer.toneMappingNode ) outgoingLightNode = context( renderer.toneMappingNode, { color: outgoingLightNode } );

		return outgoingLightNode;

	}

	generateStandardMaterial( builder, { colorNode, diffuseColorNode } ) {

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

		const normalNode = this.normalNode ? vec3( this.normalNode ) : normalView;

		builder.addFlow( 'fragment', label( normalNode, 'TransformedNormalView' ) );

		return diffuseColorNode;

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

		this.lightNode = source.lightNode;

		this.positionNode = source.positionNode;

		return super.copy( source );

	}

}

MeshStandardNodeMaterial.prototype.isMeshStandardNodeMaterial = true;
