import { MeshStandardMaterial } from '../../../../../build/three.module.js';

class MeshStandardNodeMaterial extends MeshStandardMaterial {

	constructor( parameters ) {

		super( parameters );

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

MeshStandardNodeMaterial.prototype.isNodeMaterial = true;

export default MeshStandardNodeMaterial;
