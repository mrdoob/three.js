import { Lighting, LightsNode } from 'three/webgpu';
import DynamicLightsNode from '../tsl/lighting/DynamicLightsNode.js';

const _defaultLights = /*@__PURE__*/ new LightsNode();

/**
 * A custom lighting implementation that batches supported analytic lights into
 * uniform arrays so light count changes do not recompile materials.
 *
 * ```js
 * const lighting = new DynamicLighting( { maxPointLights: 64 } );
 * renderer.lighting = lighting;
 * ```
 *
 * @augments Lighting
 * @three_import import { DynamicLighting } from 'three/addons/lighting/DynamicLighting.js';
 */
export class DynamicLighting extends Lighting {

	/**
	 * Constructs a new dynamic lighting system.
	 *
	 * @param {Object} [options={}] - Dynamic lighting configuration.
	 * @param {number} [options.maxDirectionalLights=8] - Maximum number of batched directional lights.
	 * @param {number} [options.maxPointLights=16] - Maximum number of batched point lights.
	 * @param {number} [options.maxSpotLights=16] - Maximum number of batched spot lights.
	 * @param {number} [options.maxHemisphereLights=4] - Maximum number of batched hemisphere lights.
	 */
	constructor( options = {} ) {

		super();

		this.options = {
			maxDirectionalLights: 8,
			maxPointLights: 16,
			maxSpotLights: 16,
			maxHemisphereLights: 4,
			...options
		};

		this._nodes = new WeakMap();

	}

	/**
	 * Creates a new dynamic lights node for the given array of lights.
	 *
	 * @param {Array<Light>} lights - The lights to bind to the node.
	 * @return {DynamicLightsNode} The dynamic lights node.
	 */
	createNode( lights = [] ) {

		return new DynamicLightsNode( this.options ).setLights( lights );

	}

	/**
	 * Returns a lights node for the given scene.
	 *
	 * @param {Scene} scene - The scene.
	 * @return {LightsNode} The lights node.
	 */
	getNode( scene ) {

		if ( scene.isQuadMesh ) return _defaultLights;

		let node = this._nodes.get( scene );

		if ( node === undefined ) {

			node = this.createNode();
			this._nodes.set( scene, node );

		}

		return node;

	}

}

export default DynamicLighting;
