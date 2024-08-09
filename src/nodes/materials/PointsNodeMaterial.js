import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';

import { PointsMaterial } from '../../materials/PointsMaterial.js';

const _defaultValues = /*@__PURE__*/ new PointsMaterial();

class PointsNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isPointsNodeMaterial = true;

		this.lights = false;
		this.normals = false;
		this.transparent = true;

		this.sizeNode = null;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	copy( source ) {

		this.sizeNode = source.sizeNode;

		return super.copy( source );

	}

}

export default PointsNodeMaterial;

addNodeMaterial( 'PointsNodeMaterial', PointsNodeMaterial );
