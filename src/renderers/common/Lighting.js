import { LightsNode } from '../../nodes/Nodes.js';

const _defaultLights = /*@__PURE__*/ new LightsNode();

/**
 * This renderer module manages the lights nodes which are unique
 * per scene + camera + lighting combination.
 *
 * The lights node itself is later configured in the render list
 * with the actual lights from the scene.
 *
 * @private
 */
class Lighting {

	/**
	 * Constructs a new lighting manager.
	 */
	constructor() {

		/**
		 * Whether this lighting manager is enabled or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enabled = true;

		/**
		 * A stack of light arrays saved per render via {@link Lighting#beginRender}.
		 *
		 * @private
		 * @type {Array<Array<Light>>}
		 */
		this._cache = [];

		/**
		 * A map of lights nodes per scene.
		 *
		 * @private
		 * @type {WeakMap<Scene, LightsNode>}
		 */
		this._lightsNodeMap = new WeakMap();

		/**
		 * Weak references to the lights nodes created by this lighting manager, so they
		 * can be disposed with {@link Lighting#dispose} without keeping scenes alive.
		 *
		 * @private
		 * @type {Set<WeakRef<LightsNode>>}
		 */
		this._tracked = new Set();

		/**
		 * Removes weak references from `_tracked` when their lights node has been
		 * garbage collected without an explicit `dispose()`.
		 *
		 * @private
		 * @type {FinalizationRegistry}
		 */
		this._registry = new FinalizationRegistry( ( ref ) => this._tracked.delete( ref ) );

	}

	/**
	 * Creates a new lights node for the given array of lights.
	 *
	 * @param {Array<Light>} lights - The render object.
	 * @return {LightsNode} The lights node.
	 */
	createNode( lights = [] ) {

		return new LightsNode().setLights( lights );

	}

	/**
	 * Returns a lights node for the given scene.
	 *
	 * @param {Scene} scene - The scene.
	 * @return {LightsNode} The lights node.
	 */
	getNode( scene ) {

		// Ignore renderable objects, e.g: Mesh, Sprite, etc.
		if ( scene.isScene !== true && scene.isGroup !== true ) return _defaultLights;

		let node = this._lightsNodeMap.get( scene );

		if ( node === undefined ) {

			node = this.createNode();
			this._lightsNodeMap.set( scene, node );
			this._track( node );

		}

		return node;

	}

	/**
	 * Tracks the given lights node so it is disposed with {@link Lighting#dispose}.
	 * Subclasses creating additional lights nodes should track them as well.
	 *
	 * @private
	 * @param {LightsNode} node - The lights node.
	 */
	_track( node ) {

		const ref = new WeakRef( node );

		this._tracked.add( ref );
		this._registry.register( node, ref, ref );

	}

	/**
	 * Saves the current lights of the scene's lights node so they can be restored
	 * in {@link Lighting#finishRender}. Must be paired with a `finishRender()` call
	 * to avoid memory leaks.
	 *
	 * Nested render calls might mutate the lights array so a save/restore is required
	 * for each render call.
	 *
	 * @param {Scene} scene - The scene.
	 */
	beginRender( scene ) {

		this._cache.push( this.getNode( scene ).getLights() );

	}

	/**
	 * Restores the lights saved by the matching {@link Lighting#beginRender} call.
	 *
	 * @param {Scene} scene - The scene.
	 */
	finishRender( scene ) {

		this.getNode( scene ).setLights( this._cache.pop() );

	}

	/**
	 * Frees the resources of the lights nodes created by this lighting manager. Called by
	 * the renderer when it is disposed, or by the app after replacing the lighting system.
	 * The lighting manager must not be used for rendering anymore after this call.
	 */
	dispose() {

		for ( const ref of this._tracked ) {

			const node = ref.deref();

			if ( node !== undefined ) {

				this._registry.unregister( ref );
				node.dispose();

			}

		}

		this._tracked.clear();

	}

}

export default Lighting;
