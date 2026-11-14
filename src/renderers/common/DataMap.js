/**
 * Data structure for the renderer. It is intended to manage
 * data of objects in dictionaries.
 *
 * @private
 */
class DataMap {

	/**
	 * Constructs a new data map.
	 */
	constructor() {

		/**
		 * `DataMap` internally uses a weak map
		 * to manage its data.
		 *
		 * @type {WeakMap<Object, Object>}
		 */
		this.data = new WeakMap();

	}

	/**
	 * Returns the dictionary for the given object.
	 *
	 * @param {Object} object - The object.
	 * @return {Object} The dictionary.
	 */
	get( object ) {

		let map = this.data.get( object );

		if ( map === undefined ) {

			map = this.createData( object );
			this.data.set( object, map );

		}

		return map;

	}

	/**
	 * Creates a new dictionary for the given object. Subclasses can override
	 * this method to declare all properties up front with a stable object shape.
	 *
	 * @param {Object} object - The object.
	 * @return {Object} The created dictionary.
	 */
	createData( /*object*/ ) {

		return {};

	}

	/**
	 * Deletes the dictionary for the given object.
	 *
	 * @param {Object} object - The object.
	 * @return {?Object} The deleted dictionary.
	 */
	delete( object ) {

		let map = null;

		if ( this.data.has( object ) ) {

			map = this.data.get( object );

			this.data.delete( object );

		}

		return map;

	}

	/**
	 * Returns `true` if the given object has a dictionary defined.
	 *
	 * @param {Object} object - The object to test.
	 * @return {boolean} Whether a dictionary is defined or not.
	 */
	has( object ) {

		return this.data.has( object );

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this.data = new WeakMap();

	}

}

export default DataMap;
