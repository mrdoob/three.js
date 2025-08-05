import { Lighting } from 'three/webgpu';
import { tiledLights } from '../tsl/lighting/TiledLightsNode.js';

/**
 * A custom lighting implementation based on Tiled-Lighting that overwrites the default
 * implementation in {@link WebGPURenderer}.
 *
 * ```js
 * const lighting = new TiledLighting();
 * renderer.lighting = lighting; // set lighting system
 * ```
 *
 * @augments Lighting
 * @three_import import { TiledLighting } from 'three/addons/lighting/TiledLighting.js';
 */
export class TiledLighting extends Lighting {

	/**
	 * Constructs a new lighting system.
	 */
	constructor() {

		super();

	}

	/**
	 * Creates a new tiled lights node for the given array of lights.
	 *
	 * This method is called internally by the renderer and must be overwritten by
	 * all custom lighting implementations.
	 *
	 * @param {Array<Light>} lights - The render object.
	 * @return {TiledLightsNode} The tiled lights node.
	 */
	createNode( lights = [] ) {

		return tiledLights().setLights( lights );

	}

}
