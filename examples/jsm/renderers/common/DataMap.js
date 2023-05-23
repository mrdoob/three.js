class DataMap {

	constructor() {

		this.datas = new WeakMap();

	}

	get( object ) {

		let map = this.datas.get( object );

		if ( map === undefined ) {

			map = {};
			this.datas.set( object, map );

		}

		return map;

	}

	delete( object ) {

		let map;

		if ( this.datas.has( object ) ) {

			map = this.datas.get( object );

			this.datas.delete( object );

		}

		return map;

	}

	has( object ) {

		return this.datas.has( object );

	}

	dispose() {

		this.datas.clear();

	}

}

export default DataMap;
