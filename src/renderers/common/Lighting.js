import { LightsNode } from '../../nodes/Nodes.js';
import ChainMap from './ChainMap.js';

const _defaultLights = /*@__PURE__*/ new LightsNode();

/**
 * This renderer module manages the lights nodes which are unique
 * per scene and camera combination.
 *
 * The lights node itself is later configured in the render list
 * with the actual lights from the scene.
 *
 * @private
 * @augments ChainMap
 */
class Lighting extends ChainMap {

	/**
	 * Constructs a lighting management component.
	 */
	constructor() {

		super();

	}

	/**
	 * Creates a new lights node for the given array of lights.
	 *
	 * @param {Array<Light>} lights - The render object.
	 * @return {Boolean} Whether if the given render object has an initialized geometry or not.
	 */
	createNode( lights = [] ) {

		return new LightsNode().setLights( lights );

	}

	/**
	 * Returns a lights node for the given scene and camera.
	 *
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera.
	 * @return {LightsNode} The lights node.
	 */
	getNode( scene, camera ) {

		// ignore post-processing

		if ( scene.isQuadMesh ) return _defaultLights;

		// tiled lighting

		const keys = [ scene, camera ];

		let node = this.get( keys );

		if ( node === undefined ) {

			node = this.createNode();
			this.set( keys, node );

		}

		return node;

	}

}

export default Lighting;
