import { Float32BufferAttribute } from 'three';
import InstancedPointsGeometry from './InstancedPointsGeometry.js';

class InstancedSpritesGeometry extends InstancedPointsGeometry {

	constructor() {

		super();

		this.isInstancedSpritesGeometry = true;

		this.type = 'InstancedSpritesGeometry';


		const positions = [
			- 0.5, 0.5, 0,
			 0.5, 0.5, 0,
			- 0.5, - 0.5, 0,
			 0.5, - 0.5, 0
		];

		this.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

	}

}

export default InstancedSpritesGeometry;
