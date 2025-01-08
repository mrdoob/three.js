import { Lighting } from 'three/webgpu';
import { tiledLights } from '../tsl/lighting/TiledLightsNode.js';

export class TiledLighting extends Lighting {

	constructor() {

		super();

	}

	createNode( lights = [] ) {

		return tiledLights().setLights( lights );

	}

}
