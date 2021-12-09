import { PointsMaterial } from '../../../../../build/three.module.js';

class PointsNodeMaterial extends PointsMaterial {

	constructor( parameters ) {

		super( parameters );

		this.colorNode = null;
		this.opacityNode = null;

		this.alphaTestNode = null;

		this.lightNode = null;

		this.sizeNode = null;

		this.positionNode = null;

	}

	copy( source ) {

		this.colorNode = source.colorNode;
		this.opacityNode = source.opacityNode;

		this.alphaTestNode = source.alphaTestNode;

		this.lightNode = source.lightNode;

		this.sizeNode = source.sizeNode;

		this.positionNode = source.positionNode;

		return super.copy( source );

	}

}

PointsNodeMaterial.prototype.isNodeMaterial = true;

export default PointsNodeMaterial;
