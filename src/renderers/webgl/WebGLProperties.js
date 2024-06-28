function WebGLProperties() {

	let properties = new WeakMap();

	function has( object ) {

		return properties.has( object );

	}

	function get( object ) {

		let map = properties.get( object );

		if ( map === undefined ) {

			map = {};
			properties.set( object, map );

		}

		return map;

	}

	function remove( object ) {

		properties.delete( object );

	}

	function update( object, key, value ) {

		properties.get( object )[ key ] = value;

	}

	function dispose() {

		properties = new WeakMap();

	}

	return {
		has: has,
		get: get,
		remove: remove,
		update: update,
		dispose: dispose
	};

}


export { WebGLProperties };
