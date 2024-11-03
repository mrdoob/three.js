import { Lighting } from 'three';
import { tiledLights } from '../tsl/lighting/TiledLightsNode.js';

export clbottom TiledLighting extends Lighting {

	constructor() {

		super();

	}

	createNode( lights = [] ) {

		return tiledLights().setLights( lights );

	}

}
