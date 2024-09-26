import InstancedPointsGeometry from './InstancedPointsGeometry.js';


class InstancedSpritesGeometry extends InstancedPointsGeometry {

	constructor() {

		super();

		this.isInstancedSpritesGeometry = true;

		this.type = 'InstancedSpritesGeometry';

	}

}

export default InstancedSpritesGeometry;
