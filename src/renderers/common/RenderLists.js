import ChainMap from './ChainMap.js';
import RenderList from './RenderList.js';

const _chainKeys = [];

/**
 * This renderer module manages the render lists which are unique
 * per scene and camera combination.
 *
 * @private
 */
class RenderLists {

	/**
	 * Constructs a render lists management component.
	 */
	constructor() {

		/**
		 * The internal chain map which holds the render lists.
		 *
		 * @type {ChainMap}
		 */
		this.lists = new ChainMap();

		/**
		 * The render lists which are currently in use. Lists are removed
		 * as soon as they become stale.
		 *
		 * @private
		 * @type {Set<RenderList>}
		 */
		this._activeLists = new Set();

		/**
		 * The current frame ID.
		 *
		 * @private
		 * @type {number}
		 */
		this._frameId = - 1;

	}

	/**
	 * Returns a render list for the given scene and camera.
	 *
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera.
	 * @param {Lighting} lighting - The lighting manager.
	 * @return {RenderList} The render list.
	 */
	get( scene, camera, lighting ) {

		const lists = this.lists;

		_chainKeys[ 0 ] = scene;
		_chainKeys[ 1 ] = camera;
		_chainKeys[ 2 ] = lighting;

		let list = lists.get( _chainKeys );

		if ( list === undefined ) {

			list = new RenderList( lighting, scene, camera );
			lists.set( _chainKeys, list );

		}

		_chainKeys[ 0 ] = null;
		_chainKeys[ 1 ] = null;
		_chainKeys[ 2 ] = null;

		//

		list.frameId = this._frameId;
		this._activeLists.add( list );

		return list;

	}

	/**
	 * Must be called when a new frame begins.
	 *
	 * @param {number} frameId - The current frame ID.
	 */
	update( frameId ) {

		if ( frameId === this._frameId ) return;

		this._frameId = frameId;

		for ( const list of this._activeLists ) {

			// if a render list has not been used within 10 frames, consider
			// it as inactive and clear it

			if ( frameId - list.frameId > 10 ) {

				list.clear();

				this._activeLists.delete( list );

			}

		}

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this.lists = new ChainMap();

		this._activeLists.clear();
		this._frameId = - 1;

	}

}

export default RenderLists;
