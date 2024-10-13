import ChainMap from './ChainMap.js';
import RenderList from './RenderList.js';

class RenderLists {

	constructor( lighting ) {

		this.lighting = lighting;

		this.lists = new ChainMap();

	}

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

	dispose() {

		this.lists = new ChainMap();

	}

}

export default RenderLists;
