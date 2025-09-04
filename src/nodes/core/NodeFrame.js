import { NodeUpdateType } from './constants.js';

/**
 * Management class for updating nodes. The module tracks metrics like
 * the elapsed time, delta time, the render and frame ID to correctly
 * call the node update methods {@link Node#updateBefore}, {@link Node#update}
 * and {@link Node#updateAfter} depending on the node's configuration.
 */
class NodeFrame {

	/**
	 * Constructs a new node fame.
	 */
	constructor() {

		/**
		 * The elapsed time in seconds.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.time = 0;

		/**
		 * The delta time in seconds.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.deltaTime = 0;

		/**
		 * The frame ID.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.frameId = 0;

		/**
		 * The render ID.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.renderId = 0;

		/**
		 * Used to control the {@link Node#update} call.
		 *
		 * @type {WeakMap<Node, Object>}
		 */
		this.updateMap = new WeakMap();

		/**
		 * Used to control the {@link Node#updateBefore} call.
		 *
		 * @type {WeakMap<Node, Object>}
		 */
		this.updateBeforeMap = new WeakMap();

		/**
		 * Used to control the {@link Node#updateAfter} call.
		 *
		 * @type {WeakMap<Node, Object>}
		 */
		this.updateAfterMap = new WeakMap();

		/**
		 * A reference to the current renderer.
		 *
		 * @type {?Renderer}
		 * @default null
		 */
		this.renderer = null;

		/**
		 * A reference to the current material.
		 *
		 * @type {?Material}
		 * @default null
		 */
		this.material = null;

		/**
		 * A reference to the current camera.
		 *
		 * @type {?Camera}
		 * @default null
		 */
		this.camera = null;

		/**
		 * A reference to the current 3D object.
		 *
		 * @type {?Object3D}
		 * @default null
		 */
		this.object = null;

		/**
		 * A reference to the current scene.
		 *
		 * @type {?Scene}
		 * @default null
		 */
		this.scene = null;

	}

	/**
	 * Returns a dictionary for a given node and update map which
	 * is used to correctly call node update methods per frame or render.
	 *
	 * @private
	 * @param {WeakMap<Node, Object>} referenceMap - The reference weak map.
	 * @param {Node} nodeRef - The reference to the current node.
	 * @return {Object<string,WeakMap<Object, number>>} The dictionary.
	 */
	_getMaps( referenceMap, nodeRef ) {

		let maps = referenceMap.get( nodeRef );

		if ( maps === undefined ) {

			maps = {
				renderMap: new WeakMap(),
				frameMap: new WeakMap()
			};

			referenceMap.set( nodeRef, maps );

		}

		return maps;

	}

	/**
	 * This method executes the {@link Node#updateBefore} for the given node.
	 * It makes sure {@link Node#updateBeforeType} is honored meaning the update
	 * is only executed once per frame, render or object depending on the update
	 * type.
	 *
	 * @param {Node} node - The node that should be updated.
	 */
	updateBeforeNode( node ) {

		const updateType = node.getUpdateBeforeType();
		const reference = node.updateReference( this );

		if ( updateType === NodeUpdateType.FRAME ) {

			const { frameMap } = this._getMaps( this.updateBeforeMap, reference );

			if ( frameMap.get( reference ) !== this.frameId ) {

				if ( node.updateBefore( this ) !== false ) {

					frameMap.set( reference, this.frameId );

				}

			}

		} else if ( updateType === NodeUpdateType.RENDER ) {

			const { renderMap } = this._getMaps( this.updateBeforeMap, reference );

			if ( renderMap.get( reference ) !== this.renderId ) {

				if ( node.updateBefore( this ) !== false ) {

					renderMap.set( reference, this.renderId );

				}

			}

		} else if ( updateType === NodeUpdateType.OBJECT ) {

			node.updateBefore( this );

		}

	}

	/**
	 * This method executes the {@link Node#updateAfter} for the given node.
	 * It makes sure {@link Node#updateAfterType} is honored meaning the update
	 * is only executed once per frame, render or object depending on the update
	 * type.
	 *
	 * @param {Node} node - The node that should be updated.
	 */
	updateAfterNode( node ) {

		const updateType = node.getUpdateAfterType();
		const reference = node.updateReference( this );

		if ( updateType === NodeUpdateType.FRAME ) {

			const { frameMap } = this._getMaps( this.updateAfterMap, reference );

			if ( frameMap.get( reference ) !== this.frameId ) {

				if ( node.updateAfter( this ) !== false ) {

					frameMap.set( reference, this.frameId );

				}

			}

		} else if ( updateType === NodeUpdateType.RENDER ) {

			const { renderMap } = this._getMaps( this.updateAfterMap, reference );

			if ( renderMap.get( reference ) !== this.renderId ) {

				if ( node.updateAfter( this ) !== false ) {

					renderMap.set( reference, this.renderId );

				}

			}

		} else if ( updateType === NodeUpdateType.OBJECT ) {

			node.updateAfter( this );

		}

	}

	/**
	 * This method executes the {@link Node#update} for the given node.
	 * It makes sure {@link Node#updateType} is honored meaning the update
	 * is only executed once per frame, render or object depending on the update
	 * type.
	 *
	 * @param {Node} node - The node that should be updated.
	 */
	updateNode( node ) {

		const updateType = node.getUpdateType();
		const reference = node.updateReference( this );

		if ( updateType === NodeUpdateType.FRAME ) {

			const { frameMap } = this._getMaps( this.updateMap, reference );

			if ( frameMap.get( reference ) !== this.frameId ) {

				if ( node.update( this ) !== false ) {

					frameMap.set( reference, this.frameId );

				}

			}

		} else if ( updateType === NodeUpdateType.RENDER ) {

			const { renderMap } = this._getMaps( this.updateMap, reference );

			if ( renderMap.get( reference ) !== this.renderId ) {

				if ( node.update( this ) !== false ) {

					renderMap.set( reference, this.renderId );

				}

			}

		} else if ( updateType === NodeUpdateType.OBJECT ) {

			node.update( this );

		}

	}

	/**
	 * Updates the internal state of the node frame. This method is
	 * called by the renderer in its internal animation loop.
	 */
	update() {

		this.frameId ++;

		if ( this.lastTime === undefined ) this.lastTime = performance.now();

		this.deltaTime = ( performance.now() - this.lastTime ) / 1000;

		this.lastTime = performance.now();

		this.time += this.deltaTime;

	}

}

export default NodeFrame;
