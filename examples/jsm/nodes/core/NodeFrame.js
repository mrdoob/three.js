import { NodeUpdateType } from './constants.js';

class NodeFrame {

	constructor() {

		this.time = 0;
		this.deltaTime = 0;

		this.frameId = 0;
		this.renderId = 0;

		this.startTime = null;

		this.updateMap = new WeakMap();
		this.updateBeforeMap = new WeakMap();
		this.updateAfterMap = new WeakMap();

		this.renderer = null;
		this.material = null;
		this.camera = null;
		this.object = null;
		this.scene = null;

	}

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

	update() {

		this.frameId ++;

		if ( this.lastTime === undefined ) this.lastTime = performance.now();

		this.deltaTime = ( performance.now() - this.lastTime ) / 1000;

		this.lastTime = performance.now();

		this.time += this.deltaTime;

	}

}

export default NodeFrame;
