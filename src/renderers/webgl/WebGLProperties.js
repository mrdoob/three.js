/**
 * @author fordacious / fordacious.github.io
 */

function WebGLProperties() {

	var properties = new WeakMap();

	function get( object ) {

		if ( properties.has( object ) === false ) {

			properties.set( object, {} );

		}

		return properties.get( object );

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
		get: get,
		remove: remove,
		update: update,
		dispose: dispose
	};

}


export { WebGLProperties };
