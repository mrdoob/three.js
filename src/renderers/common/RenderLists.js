import ChainMap from './ChainMap.js';
import RenderList from './RenderList.js';

/**
 * This renderer module manages the render lists which are unique
 * per scene and camera combination.
 *
 * @private
 */
class RenderLists {

	/**
	 * Constructs a render lists management component.
	 *
	 * @param {Lighting} lighting - The lighting management component.
	 */
	constructor( lighting ) {

		/**
		 * The lighting management component.
		 *
		 * @type {Lighting}
		 */
		this.lighting = lighting;

		/**
		 * The internal chain map which holds the render lists.
		 *
		 * @type {ChainMap}
		 */
		this.lists = new ChainMap();

	}

	/**
	 * Returns a render list for the given scene and camera.
	 *
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera.
	 * @return {RenderList} The render list.
	 */
	get( scene, camera ) {

		const lists = this.lists;
		const keys = [ scene, camera ];

		let list = lists.get( keys );

		if ( list === undefined ) {

			list = new RenderList( this.lighting, scene, camera );
			lists.set( keys, list );

		}

		return list;

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this.lists = new ChainMap();

	}

}

export default RenderLists;
