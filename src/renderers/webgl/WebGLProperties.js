/**
 * @author fordacious / fordacious.github.io
 */

function WebGLProperties() {

	var properties = {};

	function get( object ) {

		var uuid = object.uuid;
		var map = properties[ uuid ];

		if ( map === undefined ) {

			map = {};
			properties[ uuid ] = map;

		}

		return map;

	}

	function remove( object ) {

		delete properties[ object.uuid ];

	}

	function update( object, key, value ) {

		var uuid = object.uuid;
		var map = properties[ uuid ];

		map[ key ] = value;

	}

	function dispose() {

		properties = {};

	}

	return {
		get: get,
		remove: remove,
		update: update,
		dispose: dispose
	};

}


export { WebGLProperties };
