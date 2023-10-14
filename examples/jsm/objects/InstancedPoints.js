import {
	Mesh
} from 'three';
import InstancedPointsGeometry from '../geometries/InstancedPointsGeometry.js';
import InstancedPointsNodeMaterial from '../nodes/materials/InstancedPointsNodeMaterial.js';

class InstancedPoints extends Mesh {

	constructor( geometry = new InstancedPointsGeometry(), material = new InstancedPointsNodeMaterial() ) {

		super( geometry, material );

		this.isInstancedPoints = true;

		this.type = 'InstancedPoints';

	}

}

export default InstancedPoints;
