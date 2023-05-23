class DataMap {

	constructor() {

		this.data = new WeakMap();

	}

	get( object ) {

		let map = this.data.get( object );

		if ( map === undefined ) {

			map = {};
			this.data.set( object, map );

		}

		return map;

	}

	delete( object ) {

		let map;

		if ( this.data.has( object ) ) {

			map = this.data.get( object );

			this.data.delete( object );

		}

		return map;

	}

	has( object ) {

		return this.data.has( object );

	}

	dispose() {

		this.data.clear();

	}

}

export default DataMap;
