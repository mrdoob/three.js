import NodeMaterial from './NodeMaterial.js';
import { PointsMaterial } from 'three';

const defaultValues = new PointsMaterial();

class PointsNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isPointsNodeMaterial = true;

		this.lights = false;
		this.normals = false;

		this.transparent = true;

		this.colorNode = null;
		this.opacityNode = null;

		this.alphaTestNode = null;

		this.lightNode = null;

		this.sizeNode = null;

		this.positionNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

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

export default PointsNodeMaterial;
