export default class WebGPUWeakMap extends WeakMap {

	constructor() {

		super();

	}

	get( keys ) {

		if ( Array.isArray( keys ) ) {

			let map = this;

			for ( let i = 0; i < keys.length - 1; i ++ ) {

				map = map.get( keys[ i ] );

				if ( map === undefined ) return undefined;

			}

			return map.get( keys[ keys.length - 1 ] );

		} else {

			return super.get( keys );

		}

	}

	set( keys, value ) {

		if ( Array.isArray( keys ) ) {

			let map = this;

			for ( let i = 0; i < keys.length - 1; i ++ ) {

				const key = keys[ i ];

				if ( map.has( key ) === false ) map.set( key, new WeakMap() );

				map = map.get( key );

			}

			return map.set( keys[ keys.length - 1 ], value );

		} else {

			return super.set( keys, value );

		}

	}

	delete( keys ) {

		if ( Array.isArray( keys ) ) {

			let map = this;

			for ( let i = 0; i < keys.length - 1; i ++ ) {

				map = map.get( keys[ i ] );

				if ( map === undefined ) return false;

			}

			return map.delete( keys[ keys.length - 1 ] );

		} else {

			return super.delete( keys );

		}

	}

}
