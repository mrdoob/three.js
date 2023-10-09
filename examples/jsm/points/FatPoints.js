import {
	Mesh
} from 'three';
import { FatPointsGeometry } from '../points/FatPointsGeometry.js';
import { FatPointsMaterial } from '../points/FatPointsMaterial.js';

class FatPoints extends Mesh {

	constructor( geometry = new FatPointsGeometry(), material = new FatPointsMaterial( { color: Math.random() * 0xffffff } ) ) {

		super( geometry, material );

		this.isFatPoints = true;

		this.type = 'FatPoints';

	}

}

export { FatPoints };
