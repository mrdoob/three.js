import NodeMaterial from './NodeMaterial.js';

import { PointsMaterial } from '../PointsMaterial.js';

const _defaultValues = /*@__PURE__*/ new PointsMaterial();

class PointsNodeMaterial extends NodeMaterial {

	static get type() {

		return 'PointsNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isPointsNodeMaterial = true;

		this.lights = false;
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
