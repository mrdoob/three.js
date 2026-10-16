import { Lighting } from 'three/webgpu';
import ClusteredLightsNode from '../tsl/lighting/ClusteredLightsNode.js';

/**
 * A custom lighting implementation based on Forward+ Clustered Shading that
 * overwrites the default lighting system in {@link WebGPURenderer}. Suitable
 * for 3D scenes with many point and spot lights and real depth complexity — the view
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
	 * @param {number} [maxLights=1024] - Maximum number of point and spot lights.
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

		/**
		 * The number of renders in progress per scene. A scene rendered inside one of its own
		 * renders (e.g. by a reflector) has more than one.
		 *
		 * @private
		 * @type {WeakMap<Scene, number>}
		 */
		this._activeRenders = new WeakMap();

		/**
		 * The lights nodes of nested renders of the same scene, per scene and depth.
		 *
		 * @private
		 * @type {WeakMap<Scene, Array<ClusteredLightsNode>>}
		 */
		this._nestedNodes = new WeakMap();

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

	/**
	 * Returns the lights node of the given scene for the current render depth of that scene.
	 * A scene rendered inside one of its own renders uses another node, so it never modifies
	 * the cluster data of the outer render, which has not been submitted yet.
	 *
	 * @param {Scene} scene - The scene.
	 * @return {LightsNode} The lights node.
	 */
	getNode( scene ) {

		if ( scene.isScene !== true && scene.isGroup !== true ) return super.getNode( scene );

		const nestedDepth = ( this._activeRenders.get( scene ) || 0 ) - 1;

		if ( nestedDepth <= 0 ) return super.getNode( scene );

		let nodes = this._nestedNodes.get( scene );

		if ( nodes === undefined ) {

			nodes = [];
			this._nestedNodes.set( scene, nodes );

		}

		let node = nodes[ nestedDepth - 1 ];

		if ( node === undefined ) {

			node = this.createNode();
			nodes[ nestedDepth - 1 ] = node;

			this._track( node );

		}

		return node;

	}

	/**
	 * Saves the lights of the scene's lights node and fits its cluster grid to the framebuffer
	 * of the render. This happens before any render object of the render is prepared, and the
	 * node of this depth is not used by any pending command buffer, so resources replaced by a
	 * rebuild are freed immediately.
	 *
	 * @param {Scene} scene - The scene.
	 */
	beginRender( scene ) {

		if ( scene.isScene === true || scene.isGroup === true ) {

			this._activeRenders.set( scene, ( this._activeRenders.get( scene ) || 0 ) + 1 );

		}

		super.beginRender( scene );

		const node = this.getNode( scene );

		if ( node.isClusteredLightsNode === true ) node.updateSize();

	}

	/**
	 * Restores the lights of the scene's lights node.
	 *
	 * @param {Scene} scene - The scene.
	 */
	finishRender( scene ) {

		super.finishRender( scene );

		if ( scene.isScene === true || scene.isGroup === true ) {

			this._activeRenders.set( scene, this._activeRenders.get( scene ) - 1 );

		}

	}

}
