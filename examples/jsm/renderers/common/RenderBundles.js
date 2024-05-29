import ChainMap from './ChainMap.js';
import RenderBundle from './RenderBundle.js';

class RenderBundles {

	constructor() {

		this.lists = new ChainMap();

	}

	get( scene, camera ) {

		const lists = this.lists;
		const keys = [ scene, camera ];

		let list = lists.get( keys );

		if ( list === undefined ) {

			list = new RenderBundle( scene, camera );
			lists.set( keys, list );

		}

		return list;

	}

	dispose() {

		this.lists = new ChainMap();

	}

}

export default RenderBundles;
