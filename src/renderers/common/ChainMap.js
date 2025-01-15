/**
 * Data structure for the renderer. It allows defining values
 * with chained, hierarchical keys. Keys are meant to be
 * objects since the module internally works with Weak Maps
 * for performance reasons.
 *
 * @private
 */
class ChainMap {

	/**
	 * Constructs a new Chain Map.
	 */
	constructor() {

		/**
		 * The root Weak Map.
		 *
		 * @type {WeakMap}
		 */
		this.weakMap = new WeakMap();

	}

	/**
	 * Returns the value for the given array of keys.
	 *
	 * @param {Array<Object>} keys - List of keys.
	 * @return {Any} The value. Returns `undefined` if no value was found.
	 */
	get( keys ) {

		let map = this.weakMap;

		for ( let i = 0; i < keys.length - 1; i ++ ) {

			map = map.get( keys[ i ] );

			if ( map === undefined ) return undefined;

		}

		return map.get( keys[ keys.length - 1 ] );

	}

	/**
	 * Sets the value for the given keys.
	 *
	 * @param {Array<Object>} keys - List of keys.
	 * @param {Any} value - The value to set.
	 * @return {ChainMap} A reference to this Chain Map.
	 */
	set( keys, value ) {

		let map = this.weakMap;

		for ( let i = 0; i < keys.length - 1; i ++ ) {

			const key = keys[ i ];

			if ( map.has( key ) === false ) map.set( key, new WeakMap() );

			map = map.get( key );

		}

		map.set( keys[ keys.length - 1 ], value );

		return this;

	}

	/**
	 * Deletes a value for the given keys.
	 *
	 * @param {Array<Object>} keys - The keys.
	 * @return {Boolean} Returns `true` if the value has been removed successfully and `false` if the value has not be found.
	 */
	delete( keys ) {

		let map = this.weakMap;

		for ( let i = 0; i < keys.length - 1; i ++ ) {

			map = map.get( keys[ i ] );

			if ( map === undefined ) return false;

		}

		return map.delete( keys[ keys.length - 1 ] );

	}

}

export default ChainMap;
