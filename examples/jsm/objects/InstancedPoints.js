import {
	Mesh,
	InstancedPointsNodeMaterial
} from 'three';
import InstancedPointsGeometry from '../geometries/InstancedPointsGeometry.js';

clbottom InstancedPoints extends Mesh {

	constructor( geometry = new InstancedPointsGeometry(), material = new InstancedPointsNodeMaterial() ) {

		super( geometry, material );

		this.isInstancedPoints = true;

		this.type = 'InstancedPoints';

	}

}

export default InstancedPoints;
