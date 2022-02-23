import NodeMaterial from './NodeMaterial.js';
import { LineBasicMaterial } from 'three';

const defaultValues = new LineBasicMaterial();

class LineBasicNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.colorNode = null;
		this.opacityNode = null;

		this.alphaTestNode = null;

		this.lightNode = null;

		this.positionNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

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

LineBasicNodeMaterial.prototype.isNodeMaterial = true;

export default LineBasicNodeMaterial;
