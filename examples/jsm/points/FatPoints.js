import {
	Mesh
} from 'three';
import { FatPointsGeometry } from '../points/FatPointsGeometry.js';
import { FatPointsNodeMaterial } from 'three/nodes';

class FatPoints extends Mesh {

	constructor( geometry = new FatPointsGeometry(), material = new FatPointsNodeMaterial() ) {

		super( geometry, material );

		this.isFatPoints = true;

		this.type = 'FatPoints';

	}

}

export { FatPoints };
