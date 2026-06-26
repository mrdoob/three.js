import { Lighting } from 'three/webgpu';
import ClusteredLightsNode from '../tsl/lighting/ClusteredLightsNode.js';

/**
 * A custom lighting implementation based on Forward+ Clustered Shading that
 * overwrites the default lighting system in {@link WebGPURenderer}. Suitable
 * for 3D scenes with many point lights and real depth complexity — the view
 * frustum is partitioned into a 3D cluster grid so only the lights actually
 * reaching each fragment are evaluated.
 *
 * ```js
 * const lighting = new ClusteredLighting();
 * renderer.lighting = lighting; // set lighting system
 * ```
 *
 * @augments Lighting
 * @three_import import { ClusteredLighting } from 'three/addons/lighting/ClusteredLighting.js';
 */
export class ClusteredLighting extends Lighting {

	/**
	 * Constructs a new clustered lighting system.
	 *
	 * @param {number} [maxLights=1024] - Maximum number of point lights.
	 * @param {number} [tileSize=32] - Screen tile size in pixels (cluster XY size).
	 * @param {number} [zSlices=24] - Number of exponential depth slices.
	 * @param {number} [maxLightsPerCluster=64] - Per-cluster light-list capacity.
	 */
	constructor( maxLights = 1024, tileSize = 32, zSlices = 24, maxLightsPerCluster = 64 ) {

		super();

		this.maxLights = maxLights;
		this.tileSize = tileSize;
		this.zSlices = zSlices;
		this.maxLightsPerCluster = maxLightsPerCluster;

	}

	/**
	 * Creates a new clustered lights node for the given array of lights.
	 *
	 * This method is called internally by the renderer and must be overwritten by
	 * all custom lighting implementations.
	 *
	 * @param {Array<Light>} lights - The lights.
	 * @return {ClusteredLightsNode} The clustered lights node.
	 */
	createNode( lights = [] ) {

		return new ClusteredLightsNode( this.maxLights, this.tileSize, this.zSlices, this.maxLightsPerCluster ).setLights( lights );

	}

}
