import { MeshBasicMaterial } from '../../../../../build/three.module.js';

class MeshBasicNodeMaterial extends MeshBasicMaterial {

	constructor( parameters ) {

		super( parameters );

		this.colorNode = null;
		this.opacityNode = null;

		this.alphaTestNode = null;

		this.lightNode = null;

		this.positionNode = null;

	}

	copy( source ) {

		this.colorNode = source.colorNode;
		this.opacityNode = source.opacityNode;

		this.alphaTestNode = source.alphaTestNode;

		this.lightNode = source.lightNode;

		this.positionNode = source.positionNode;

		return super.copy( source );

	}

}

MeshBasicNodeMaterial.prototype.isNodeMaterial = true;

export default MeshBasicNodeMaterial;
