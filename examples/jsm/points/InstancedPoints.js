import {
	Mesh
} from 'three';
import InstancedPointsGeometry from '../points/InstancedPointsGeometry.js';
import { InstancedPointsNodeMaterial } from 'three/nodes';

class InstancedPoints extends Mesh {

	constructor( geometry = new InstancedPointsGeometry(), material = new InstancedPointsNodeMaterial() ) {

		super( geometry, material );

		this.isInstancedPoints = true;

		this.type = 'InstancedPoints';

	}

}

export default InstancedPoints;
