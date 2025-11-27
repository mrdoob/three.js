import { LightsNode } from '../../nodes/Nodes.js';
import ChainMap from './ChainMap.js';

const _defaultLights = /*@__PURE__*/ new LightsNode();
const _chainKeys = [];

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

		this._lightsNodes = new Set();

	}

	/**
	 * Creates a new lights node for the given array of lights.
	 *
	 * @param {Array<Light>} lights - The render object.
	 * @return {LightsNode} The lights node.
	 */
	createNode( lights = [] ) {

		const node = new LightsNode().setLights( lights );
		this._lightsNodes.add( node );

		return node;

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

		_chainKeys[ 0 ] = scene;
		_chainKeys[ 1 ] = camera;

		let node = this.get( _chainKeys );

		if ( node === undefined ) {

			node = this.createNode();
			this.set( _chainKeys, node );

		}

		_chainKeys.length = 0;

		return node;

	}

	/**
	 * Frees lights nodes stored in this manager.
	 */
	dispose() {

		for ( const node of this._lightsNodes ) {

			node.dispose();

		}

		this._lightsNodes.clear();

	}

}

export default Lighting;
