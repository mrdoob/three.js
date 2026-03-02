import { LightsNode } from '../../nodes/Nodes.js';

const _defaultLights = /*@__PURE__*/ new LightsNode();
const _weakMap = /*@__PURE__*/ new WeakMap();

/**
 * This renderer module manages the lights nodes which are unique
 * per scene and camera combination.
 *
 * The lights node itself is later configured in the render list
 * with the actual lights from the scene.
 *
 * @private
 */
class Lighting {

	/**
	 * Constructs a new lighting module.
	 *
	 * @param {Renderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		this.renderer = renderer;

	}

	/**
	 * Creates a new lights node for the given array of lights.
	 *
	 * @param {Array<Light>} lights - The render object.
	 * @return {LightsNode} The lights node.
	 */
	createNode( lights = [] ) {

		const node = new LightsNode();
		node._renderer = this.renderer;
		return node.setLights( lights );

	}

	/**
	 * Returns a lights node for the given scene and camera.
	 *
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera.
	 * @return {LightsNode} The lights node.
	 */
	getNode( scene ) {

		// ignore post-processing

		if ( scene.isQuadMesh ) return _defaultLights;

		let node = _weakMap.get( scene );

		if ( node === undefined ) {

			node = this.createNode();
			_weakMap.set( scene, node );

		}

		// Always update renderer reference (e.g. when renderer is recreated)
		node._renderer = this.renderer;

		return node;

	}

}

export default Lighting;
