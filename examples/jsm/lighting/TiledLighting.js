import * as THREE from 'three';
import { tiledLights } from '../tsl/lighting/TiledLightsNode.js';

export class TiledLighting extends THREE.Lighting {

	constructor() {

		super();

	}

	createNode( lights = [] ) {

		return tiledLights().setLights( lights );

	}

}
