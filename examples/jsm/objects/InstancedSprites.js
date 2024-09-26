import { Mesh, InstancedSpritesNodeMaterial } from 'three';

import InstancedSpritesGeometry from '../geometries/InstancedSpritesGeometry.js';

class InstancedSprites extends Mesh {

	constructor( geometry = new InstancedSpritesGeometry(), material = new InstancedSpritesNodeMaterial() ) {

		super( geometry, material );

		this.isInstancedSprites = true;

		this.type = 'InstancedSprites';

	}

}

export default InstancedSprites;
