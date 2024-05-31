export default class ChainMap {

	constructor() {

		this.weakMap = new WeakMap();

	}

	get( keys ) {

		let map = this.weakMap;

		for ( let i = 0; i < keys.length; i ++ ) {

			map = map.get( keys[ i ] );

			if ( map === undefined ) return undefined;

		}

		return map.get( keys[ keys.length - 1 ] );

	}

	set( keys, value ) {

		let map = this.weakMap;

		for ( let i = 0; i < keys.length; i ++ ) {

			const key = keys[ i ];

			if ( map.has( key ) === false ) map.set( key, new WeakMap() );

			map = map.get( key );

		}

		return map.set( keys[ keys.length - 1 ], value );

	}

	delete( keys ) {

		let map = this.weakMap;

		for ( let i = 0; i < keys.length; i ++ ) {

			map = map.get( keys[ i ] );

			if ( map === undefined ) return false;

		}

		return map.delete( keys[ keys.length - 1 ] );

	}

}
