import NodeMaterial from './NodeMaterial.js';
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
