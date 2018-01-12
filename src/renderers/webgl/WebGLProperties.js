/**
 * @author fordacious / fordacious.github.io
 */

function WebGLProperties() {

	var properties = new WeakMap();

	function get( object ) {

		var map = properties.get( object );

		if ( map === undefined ) {

			map = {};
			properties.set( object, map);

		}

		return map;

	}

	function remove( object ) {

		properties.delete( object );

	}

	function dispose() {

		properties = new WeakMap();

	}

	return {
		get: get,
		remove: remove,
		dispose: dispose
	};

}


export { WebGLProperties };
